import binascii
import contextlib
import io
import json
import logging
import tempfile
import typing as t
from enum import Enum
from pathlib import Path
from typing import Optional, Union

from aea.configurations.data_types import PackageType
from aea.helpers.base import IPFSHash, cd
from aea_ledger_ethereum.ethereum import EthereumCrypto
from autonomy.chain.base import registry_contracts
from autonomy.chain.config import ChainConfigs, ChainType, ContractConfigs
from autonomy.chain.service import get_agent_instances, get_service_info
from autonomy.cli.helpers.chain import MintHelper as MintManager
from autonomy.cli.helpers.chain import OnChainHelper
from autonomy.cli.helpers.chain import ServiceHelper as ServiceManager
from hexbytes import HexBytes

logging.basicConfig(level=logging.DEBUG)


NULL_ADDRESS: str = "0x" + "0" * 40
MAX_UINT256 = 2**256 - 1


class SafeOperation(Enum):
    """Operation types."""

    CALL = 0
    DELEGATE_CALL = 1
    CREATE = 2


class MultiSendOperation(Enum):
    """Operation types."""

    CALL = 0
    DELEGATE_CALL = 1


def hash_payload_to_hex(
    safe_tx_hash: str,
    ether_value: int,
    safe_tx_gas: int,
    to_address: str,
    data: bytes,
    operation: int = SafeOperation.CALL.value,
    base_gas: int = 0,
    safe_gas_price: int = 0,
    gas_token: str = NULL_ADDRESS,
    refund_receiver: str = NULL_ADDRESS,
    use_flashbots: bool = False,
    gas_limit: int = 0,
    raise_on_failed_simulation: bool = False,
) -> str:
    """Serialise to a hex string."""
    if len(safe_tx_hash) != 64:  # should be exactly 32 bytes!
        raise ValueError(
            "cannot encode safe_tx_hash of non-32 bytes"
        )  # pragma: nocover

    if len(to_address) != 42 or len(gas_token) != 42 or len(refund_receiver) != 42:
        raise ValueError("cannot encode address of non 42 length")  # pragma: nocover

    if (
        ether_value > MAX_UINT256
        or safe_tx_gas > MAX_UINT256
        or base_gas > MAX_UINT256
        or safe_gas_price > MAX_UINT256
        or gas_limit > MAX_UINT256
    ):
        raise ValueError(
            "Value is bigger than the max 256 bit value"
        )  # pragma: nocover

    if operation not in [v.value for v in SafeOperation]:
        raise ValueError("SafeOperation value is not valid")  # pragma: nocover

    if not isinstance(use_flashbots, bool):
        raise ValueError(
            f"`use_flashbots` value ({use_flashbots}) is not valid. A boolean value was expected instead"
        )

    ether_value_ = ether_value.to_bytes(32, "big").hex()
    safe_tx_gas_ = safe_tx_gas.to_bytes(32, "big").hex()
    operation_ = operation.to_bytes(1, "big").hex()
    base_gas_ = base_gas.to_bytes(32, "big").hex()
    safe_gas_price_ = safe_gas_price.to_bytes(32, "big").hex()
    use_flashbots_ = use_flashbots.to_bytes(32, "big").hex()
    gas_limit_ = gas_limit.to_bytes(32, "big").hex()
    raise_on_failed_simulation_ = raise_on_failed_simulation.to_bytes(32, "big").hex()

    concatenated = (
        safe_tx_hash
        + ether_value_
        + safe_tx_gas_
        + to_address
        + operation_
        + base_gas_
        + safe_gas_price_
        + gas_token
        + refund_receiver
        + use_flashbots_
        + gas_limit_
        + raise_on_failed_simulation_
        + data.hex()
    )
    return concatenated


def skill_input_hex_to_payload(payload: str) -> dict:
    """Decode payload."""
    tx_params = dict(
        safe_tx_hash=payload[:64],
        ether_value=int.from_bytes(bytes.fromhex(payload[64:128]), "big"),
        safe_tx_gas=int.from_bytes(bytes.fromhex(payload[128:192]), "big"),
        to_address=payload[192:234],
        operation=int.from_bytes(bytes.fromhex(payload[234:236]), "big"),
        base_gas=int.from_bytes(bytes.fromhex(payload[236:300]), "big"),
        safe_gas_price=int.from_bytes(bytes.fromhex(payload[300:364]), "big"),
        gas_token=payload[364:406],
        refund_receiver=payload[406:448],
        use_flashbots=bool.from_bytes(bytes.fromhex(payload[448:512]), "big"),
        gas_limit=int.from_bytes(bytes.fromhex(payload[512:576]), "big"),
        raise_on_failed_simulation=bool.from_bytes(
            bytes.fromhex(payload[576:640]), "big"
        ),
        data=bytes.fromhex(payload[640:]),
    )
    return tx_params


class OnchainState(Enum):
    PRE_REGISTRATION = "PRE_REGISTRATION"
    ACTIVE_REGISTRATION = "ACTIVE_REGISTRATION"
    FINISHED_REGISTRATION = "FINISHED_REGISTRATION"
    DEPLOYED = "DEPLOYED"
    TERMINATED_BONDED = "TERMINATED_BONDED"


class OnChainManager:
    """On chain service management."""

    def __init__(
        self,
        rpc: str,
        key: Path,
        chain_type: ChainType,
        custom_addresses: t.Dict,
    ) -> None:
        """On chain manager."""
        self.rpc = rpc
        self.key = key
        self.chain_type = chain_type
        self.custom_addresses = custom_addresses

    def _patch(self) -> None:
        """Patch contract and chain config."""
        ChainConfigs.get(self.chain_type).rpc = self.rpc
        if self.chain_type != ChainType.CUSTOM:
            return

        for name, address in self.custom_addresses.items():
            ContractConfigs.get(name=name).contracts[self.chain_type] = address

    def info(self, service_id: int) -> t.Dict:
        """Get service info."""
        self._patch()
        ledger_api, _ = OnChainHelper.get_ledger_and_crypto_objects(
            chain_type=self.chain_type
        )
        (
            security_deposit,
            multisig_address,
            config_hash,
            threshold,
            max_agents,
            number_of_agent_instances,
            service_state,
            cannonical_agents,
        ) = get_service_info(
            ledger_api=ledger_api,
            chain_type=self.chain_type,
            token_id=service_id,
        )
        instances = get_agent_instances(
            ledger_api=ledger_api,
            chain_type=self.chain_type,
            token_id=service_id,
        ).get("agentInstances", [])
        return dict(
            security_deposit=security_deposit,
            multisig_address=multisig_address,
            config_hash=config_hash,
            threshold=threshold,
            max_agents=max_agents,
            number_of_agent_instances=number_of_agent_instances,
            service_state=service_state,
            cannonical_agents=cannonical_agents,
            instances=instances,
        )

    def mint(
        self,
        package_path: Path,
        agent_id: int,
        number_of_slots: int,
        cost_of_bond: int,
        threshold: int,
        nft: Optional[Union[Path, IPFSHash]],
    ):
        "Mint service."
        # TODO: Support for update

        logging.info(f"Minting {package_path}...")

        self._patch()

        manager = (
            MintManager(
                chain_type=self.chain_type,
                key=self.key,
            )
            .load_package_configuration(
                package_path=package_path, package_type=PackageType.SERVICE
            )
            .load_metadata()
            .verify_nft(nft=nft)
            .verify_service_dependencies(agent_id=agent_id)
            .publish_metadata()
        )

        with tempfile.TemporaryDirectory() as temp, contextlib.redirect_stdout(
            io.StringIO()
        ):
            with cd(temp):
                manager.mint_service(
                    number_of_slots=number_of_slots,
                    cost_of_bond=cost_of_bond,
                    threshold=threshold,
                )
                (metadata,) = Path(temp).glob("*.json")
                published = {
                    "token": int(Path(metadata).name.replace(".json", "")),
                    "metadata": json.loads(Path(metadata).read_text(encoding="utf-8")),
                }
        return published

    def activate(
        self,
        service_id: int,
        token: t.Optional[str] = None,
    ) -> None:
        """Activate service."""
        logging.info(f"Activating {service_id}...")
        self._patch()
        with contextlib.redirect_stdout(io.StringIO()):
            ServiceManager(
                service_id=service_id,
                chain_type=self.chain_type,
                key=self.key,
            ).check_is_service_token_secured(
                token=token,
            ).activate_service()

    def register(
        self,
        service_id: int,
        instances: t.List[str],
        agents: t.List[int],
        token: t.Optional[str] = None,
    ) -> None:
        """Register instance."""
        logging.info(f"Registering {service_id}...")
        with contextlib.redirect_stdout(io.StringIO()):
            ServiceManager(
                service_id=service_id,
                chain_type=self.chain_type,
                key=self.key,
            ).check_is_service_token_secured(
                token=token,
            ).register_instance(
                instances=instances,
                agent_ids=agents,
            )

    def deploy(
        self,
        service_id: int,
        reuse_multisig: bool = False,
        token: t.Optional[str] = None,
    ) -> None:
        """Deploy service."""
        logging.info(f"Deploying {service_id}...")
        self._patch()
        with contextlib.redirect_stdout(io.StringIO()):
            ServiceManager(
                service_id=service_id,
                chain_type=self.chain_type,
                key=self.key,
            ).check_is_service_token_secured(
                token=token,
            ).deploy_service(
                reuse_multisig=reuse_multisig,
            )

    def swap(
        self,
        service_id: int,
        multisig: str,
        owner_key: str,
    ) -> None:
        """Swap safe owner."""
        manager = ServiceManager(
            service_id=service_id,
            chain_type=self.chain_type,
            key=self.key,
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            key_file = Path(temp_dir, "key.txt")
            key_file.write_text(owner_key)
            owner_crypto = EthereumCrypto(private_key_path=str(key_file))
        owner_cryptos: list[EthereumCrypto] = [owner_crypto]
        owners = [
            manager.ledger_api.api.to_checksum_address(owner_crypto.address)
            for owner_crypto in owner_cryptos
        ]
        owner_to_swap = owners[0]
        multisend_txs = []
        txd = registry_contracts.gnosis_safe.get_swap_owner_data(
            ledger_api=manager.ledger_api,
            contract_address=multisig,
            old_owner=manager.ledger_api.api.to_checksum_address(owner_to_swap),
            new_owner=manager.ledger_api.api.to_checksum_address(
                manager.crypto.address
            ),
        ).get("data")
        multisend_txs.append(
            {
                "operation": MultiSendOperation.CALL,
                "to": multisig,
                "value": 0,
                "data": HexBytes(txd[2:]),
            }
        )
        multisend_txd = registry_contracts.multisend.get_tx_data(  # type: ignore
            ledger_api=manager.ledger_api,
            contract_address=ContractConfigs.multisend.contracts[self.chain_type],
            multi_send_txs=multisend_txs,
        ).get("data")
        multisend_data = bytes.fromhex(multisend_txd[2:])
        safe_tx_hash = registry_contracts.gnosis_safe.get_raw_safe_transaction_hash(
            ledger_api=manager.ledger_api,
            contract_address=multisig,
            to_address=ContractConfigs.multisend.contracts[self.chain_type],
            value=0,
            data=multisend_data,
            safe_tx_gas=0,
            operation=SafeOperation.DELEGATE_CALL.value,
        ).get("tx_hash")[2:]
        payload_data = hash_payload_to_hex(
            safe_tx_hash=safe_tx_hash,
            ether_value=0,
            safe_tx_gas=0,
            to_address=ContractConfigs.multisend.contracts[self.chain_type],
            data=multisend_data,
        )
        tx_params = skill_input_hex_to_payload(payload=payload_data)
        safe_tx_bytes = binascii.unhexlify(tx_params["safe_tx_hash"])
        owner_to_signature = {}
        for owner_crypto in owner_cryptos:
            signature = owner_crypto.sign_message(
                message=safe_tx_bytes,
                is_deprecated_mode=True,
            )
            owner_to_signature[
                manager.ledger_api.api.to_checksum_address(owner_crypto.address)
            ] = signature[2:]
        tx = registry_contracts.gnosis_safe.get_raw_safe_transaction(
            ledger_api=manager.ledger_api,
            contract_address=multisig,
            sender_address=owner_crypto.address,
            owners=tuple(owners),  # type: ignore
            to_address=tx_params["to_address"],
            value=tx_params["ether_value"],
            data=tx_params["data"],
            safe_tx_gas=tx_params["safe_tx_gas"],
            signatures_by_owner=owner_to_signature,
            operation=SafeOperation.DELEGATE_CALL.value,
        )
        stx = owner_crypto.sign_transaction(tx)
        tx_digest = manager.ledger_api.send_signed_transaction(stx)
        receipt = manager.ledger_api.api.eth.wait_for_transaction_receipt(tx_digest)
        if receipt["status"] != 1:
            raise RuntimeError("Error swapping owners")

    def terminate(
        self,
        service_id: int,
        token: t.Optional[str] = None,
    ) -> None:
        """Terminate service."""
        with contextlib.redirect_stdout(io.StringIO()):
            ServiceManager(
                service_id=service_id,
                chain_type=self.chain_type,
                key=self.key,
            ).check_is_service_token_secured(
                token=token,
            ).terminate_service()

    def unbond(
        self,
        service_id: int,
        token: t.Optional[str] = None,
    ) -> None:
        """Unbond service."""
        with contextlib.redirect_stdout(io.StringIO()):
            ServiceManager(
                service_id=service_id,
                chain_type=self.chain_type,
                key=self.key,
            ).check_is_service_token_secured(
                token=token,
            ).unbond_service()
