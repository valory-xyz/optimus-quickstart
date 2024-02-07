import contextlib
import io
import json
import tempfile
import typing as t
from enum import Enum
from pathlib import Path
from typing import Optional, Union

from aea.configurations.data_types import PackageType
from aea.helpers.base import IPFSHash, cd
from autonomy.chain.config import (
    ChainConfigs,
    ChainType,
    ContractConfig,
    ContractConfigs,
)
from autonomy.chain.service import get_agent_instances, get_service_info
from autonomy.cli.helpers.chain import MintHelper as MintManager
from autonomy.cli.helpers.chain import OnChainHelper
from autonomy.cli.helpers.chain import ServiceHelper as ServiceManager


class OnchainState(Enum):
    PRE_REGISTRATION = "PRE_REGISTRATION"
    ACTIVE_REGISTRATION = "ACTIVE_REGISTRATION"
    FINISHED_REGISTRATION = "FINISHED_REGISTRATION"
    DEPLOYED = "DEPLOYED"
    TERMINATED_BONDED = "TERMINATED_BONDED"


class OnChainManager:
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
