"""Fund an address on gnosis fork."""

import sys
import os
from aea_ledger_ethereum.ethereum import EthereumApi, EthereumCrypto
from pathlib import Path
import json
from dotenv import load_dotenv

OLAS_CONTRACT_ADDRESS_GNOSIS = "0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f"

load_dotenv()
address = sys.argv[1]
staking_keys_path = os.environ.get("STAKING_TEST_KEYS_PATH", None)
ledger_api = EthereumApi(address="http://localhost:8545")
crypto = EthereumCrypto("scripts/keys/gnosis.txt")
tx = ledger_api.get_transfer_transaction(
    sender_address=crypto.address,
    destination_address=address,
    amount=10000000000000000000,
    tx_fee=50000,
    tx_nonce="0x",
    chain_id=100,
)
stx = crypto.sign_transaction(transaction=tx)
digest = ledger_api.send_signed_transaction(stx)
ledger_api.get_transaction_receipt(tx_digest=digest, raise_on_try=True)

print(ledger_api.get_balance(address=address))

if staking_keys_path:
    staking_crypto = EthereumCrypto(staking_keys_path)

    with open(Path("operate", "data", "contracts", "uniswap_v2_erc20", "build", "IUniswapV2ERC20.json"), "r") as abi_file:
        abi = json.load(abi_file)["abi"]

    olas_contract = ledger_api.api.eth.contract(
        address=ledger_api.api.to_checksum_address(OLAS_CONTRACT_ADDRESS_GNOSIS),
        abi=abi
    )

    tx = olas_contract.functions.transfer(address, int(2e18)).build_transaction({
        "chainId": 100,
        "gas": 100000,
        "gasPrice": ledger_api.api.to_wei("50", "gwei"),
        "nonce": ledger_api.api.eth.get_transaction_count(staking_crypto.address),
    })

    signed_txn = ledger_api.api.eth.account.sign_transaction(tx, staking_crypto.private_key)
    tx_hash = ledger_api.api.eth.send_raw_transaction(signed_txn.rawTransaction)

    balance = olas_contract.functions.balanceOf(address).call()
    print(f"Balance of {address} = {balance/1e18} OLAS")