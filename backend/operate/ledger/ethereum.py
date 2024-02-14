# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2023 Valory AG
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# ------------------------------------------------------------------------------

"""Ethereum ledger helpers."""

import typing as t
from datetime import datetime
from aea_ledger_ethereum import EthereumCrypto, EthereumApi
from operate.ledger.base import LedgerHelper
from operate.types import LedgerType
from web3 import HTTPProvider, Web3
from operate.ledger.profiles import CONTRACTS
from operate.types import ChainType
import json
from pathlib import Path
from requests.exceptions import ConnectionError as RequestsConnectionError
from autonomy.chain.exceptions import (
    ChainInteractionError,
    ChainTimeoutError,
    RPCError,
)
from eth_typing import HexStr
from autonomy.chain.tx import (
    TxSettler,
    should_retry,
    should_reprice,
)
import time
from enum import Enum


DEFAULT_ON_CHAIN_INTERACT_TIMEOUT = 120.0
DEFAULT_ON_CHAIN_INTERACT_RETRIES = 10
DEFAULT_ON_CHAIN_INTERACT_SLEEP = 6.0
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
ZERO_ETH = 0

GAS_PARAMS = {
    "maxFeePerGas": 30_000_000_000,
    "maxPriorityFeePerGas": 3_000_000_000,
    "gas": 500_000,
}


class StakingState(Enum):
    """Staking state enumeration for the staking."""

    UNSTAKED = 0
    STAKED = 1
    EVICTED = 2


class Ethereum(LedgerHelper):
    """Ethereum ledger helper."""

    api: Web3

    def __init__(self, rpc: str) -> None:
        super().__init__(rpc)
        self.ledger_api = EthereumApi(address=self.rpc)
        self.api = self.ledger_api.api
        self.contracts = {chain_type: {} for chain_type in ChainType}
        self.load_contracts()

    def create_key(self) -> t.Dict:
        """Create key."""
        account = EthereumCrypto()
        return {
            "address": account.address,
            "private_key": account.private_key,
            "encrypted": False,
            "ledger": LedgerType.ETHEREUM,
        }

    def load_contracts(self) -> None:
        """Load all contracts"""

        for abi_path in Path("operate", "ledger", "abis").iterdir():
            for chain_type in ChainType:
                if chain_type not in CONTRACTS:
                    continue
                if abi_path.stem not in CONTRACTS[chain_type]:
                    continue
                with open(abi_path, "r") as abi_file:
                    abi = json.load(abi_file)["abi"]
                    self.contracts[chain_type][abi_path.stem] = self.api.eth.contract(
                        address=CONTRACTS[chain_type][abi_path.stem],
                        abi=abi
                    )


    def get_staking_status(self, service_id) -> StakingState:
        """Is the service staked?"""
        staking_contract = self.contracts[ChainType.GNOSIS]["ServiceStakingToken"]
        a = staking_contract.functions.getServiceStakingState(service_id).call()
        return StakingState(a)


    def is_available_slots(self) -> bool:
        """Check if there are available slots on the staking contract"""
        staking_contract = self.contracts[ChainType.GNOSIS]["ServiceStakingToken"]
        max_num_services = staking_contract.functions.maxNumServices().call()
        service_ids = staking_contract.functions.getServiceIds().call()
        return max_num_services - len(service_ids)


    def stake(self, service_id, crypto) -> bool:
        """Stake the service"""

        if self.get_staking_status(service_id) != StakingState.UNSTAKED:
            return False

        staking_contract = self.contracts[ChainType.GNOSIS]["ServiceStakingToken"]
        erc20_contract = self.contracts[ChainType.GNOSIS]["ERC20"]

        # Approval tx: approve the service token to be spent
        # We make use of the ERC20 contract to build the approval transaction
        # since it has the same interface as ERC721
        # We use the ZERO_ADDRESS as the contract address since we don't do any contract interaction here,
        # we are simply encoding
        spender = staking_contract.address
        amount = service_id
        data = erc20_contract.encodeABI("approve", args=(spender, amount))

        approval_tx = {
            "data": bytes.fromhex(data[2:]),
            "to": CONTRACTS[ChainType.GNOSIS]["service_registry"],
            "value": ZERO_ETH,
        }

        # Stake tx
        stake_tx = staking_contract.encodeABI("stake", args=[service_id])

        # Send txs
        for tx in (approval_tx, stake_tx):
            self.send_tx_and_wait_for_receipt(crypto, tx)

        return True


    def unstake(self, service_id, crypto) -> bool:
        """Unstake the service"""

        if self.get_staking_status(service_id) != StakingState.STAKED:
            return False

        # TODO: check unstaking availability for EVICTED services

        staking_contract = self.contracts[ChainType.GNOSIS]["ServiceStakingToken"]
        data = staking_contract.encodeABI("unstake", args=[service_id])

        unstake_tx = {
            "data": bytes.fromhex(data[2:]),
            "to": CONTRACTS[ChainType.GNOSIS]["ServiceStakingToken"],
            "value": ZERO_ETH,
        }

        self.send_tx_and_wait_for_receipt(crypto, unstake_tx)

        return True


    def send_tx_and_wait_for_receipt(
        self,
        crypto: EthereumCrypto,
        raw_tx: t.Dict[str, t.Any],
    ) -> t.Dict[str, t.Any]:
        """Send transaction and wait for receipt."""
        receipt = HexStr(self.send_tx(crypto, raw_tx))
        if receipt["status"] != 1:
            raise ValueError("Transaction failed. Receipt:", receipt)
        return receipt


    def send_tx(
        self,
        crypto: EthereumCrypto,
        raw_tx: t.Dict[str, t.Any],
        timeout: float = DEFAULT_ON_CHAIN_INTERACT_TIMEOUT,
        max_retries: int = DEFAULT_ON_CHAIN_INTERACT_RETRIES,
        sleep: float = DEFAULT_ON_CHAIN_INTERACT_SLEEP,
    ) -> str:
        """Send transaction."""
        tx_dict = {
            **raw_tx,
            **GAS_PARAMS,
            "from": crypto.address,
            "nonce": self.api.eth.get_transaction_count(crypto.address),
            "chainId": self.api.eth.chain_id,
        }
        gas_params = self.ledger_api.try_get_gas_pricing()
        if gas_params is not None:
            tx_dict.update(gas_params)

        tx_settler = TxSettler(self.api, crypto, ChainType.CUSTOM)
        retries = 0
        tx_digest = None
        already_known = False
        deadline = datetime.now().timestamp() + timeout
        while retries < max_retries and deadline >= datetime.now().timestamp():
            retries += 1
            try:
                if not already_known:
                    tx_signed = crypto.sign_transaction(transaction=tx_dict)
                    tx_digest = self.ledger_api.send_signed_transaction(
                        tx_signed=tx_signed,
                        raise_on_try=True,
                    )
                tx_receipt = self.api.eth.get_transaction_receipt(
                    t.cast(str, tx_digest)
                )
                if tx_receipt is not None:
                    return tx_receipt
            except RequestsConnectionError as e:
                raise RPCError("Cannot connect to the given RPC") from e
            except Exception as e:  # pylint: disable=broad-except
                error = str(e)
                if tx_settler._already_known(error):
                    already_known = True
                    continue  # pragma: nocover
                if not should_retry(error):
                    raise ChainInteractionError(error) from e
                if should_reprice(error):
                    print("Repricing the transaction...")
                    tx_dict = tx_settler._repice(t.cast(t.Dict, tx_dict))
                    continue
                print(f"Error occurred when interacting with chain: {e}; ")
                print(f"will retry in {sleep}...")
                time.sleep(sleep)
        raise ChainTimeoutError("Timed out when waiting for transaction to go through")