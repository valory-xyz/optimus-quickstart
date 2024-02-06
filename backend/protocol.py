from autonomy.cli.helpers.chain import ServiceHelper, MintHelper
from autonomy.chain.config import ChainType
from typing import Optional, Union
from pathlib import Path
from aea.configurations.data_types import PackageType
from autonomy.chain.config import ChainType
from aea.helpers.base import IPFSHash
from enum import Enum


class OnchainState(Enum):

    PRE_REGISTRATION = "PRE_REGISTRATION"
    ACTIVE_REGISTRATION = "ACTIVE_REGISTRATION"
    FINISHED_REGISTRATION = "FINISHED_REGISTRATION"
    DEPLOYED = "DEPLOYED"
    TERMINATED_BONDED = "TERMINATED_BONDED"


class Service:

    def __init__(self, service_id, service_path, chain_type, key) -> None:
        self.service_id = service_id
        self.service_path = service_path
        self.chain_type = chain_type
        self.key = key
        self.token = None

        self.service_helper = ServiceHelper(
            service_id=self.service_id,
            chain_type=ChainType(self.chain_type),
            key=self.key,
            password=None,
            hwi=None,
            dry_run=None,
            timeout=60,
            retries=3,
            sleep=None,
        ).check_is_service_token_secured(
            token=self.token,
        )

        self.mint_helper = MintHelper(
            chain_type=ChainType(self.chain_type),
            key=self.key,
            password=None,
            hwi=None,
            update_token=None,  # TODO
            dry_run=False,
            timeout=60,
            retries=3,
            sleep=None,
        )

    def info(self):
        pass

    def mint(
        self,
        agent_id: int,
        nft: Optional[Union[Path, IPFSHash]],
        update: Optional[int]
    ):
        self.mint_helper.load_package_configuration(
            package_path=self.service_path, package_type=PackageType.SERVICE
        ).load_metadata().verify_nft(
            nft=nft
        ).verify_service_dependencies(
            agent_id=agent_id
        ).publish_metadata()

        if update is not None:
            return self.mint_helper.update_service(
                number_of_slots=number_of_slots,
                cost_of_bond=cost_of_bond,
                threshold=threshold,
                token=self.token,
            )
        return self.mint_helper.mint_service(
            number_of_slots=number_of_slots,
            cost_of_bond=cost_of_bond,
            threshold=threshold,
            token=token,
            owner=owner,
        )

    def activate(self):
        self.service_helper.activate_service()

    def register(self):
        pass

    def deploy(self):
        pass

    def terminate(self):
        pass

    def unbond(self):
        pass

    def safe_swap(self):
        pass


    def onchain_setup(self):

        # pseudocode - follows the quickstart
        state = self.get_state()

        if not self.minted:
            self.mint()

        if needs_update:

            if state == OnchainState.DEPLOYED and safe.owner == agent:
                state = self.safe_swap(operator)

            if state == OnchainState.DEPLOYED:
                state = self.terminate()

            if state == OnchainState.TERMINATED_BONDED:
                state = self.unbond()

            if state == OnchainState.PRE_REGISTRATION:
                state = self.mint(update)


        if state == OnchainState.PRE_REGISTRATION:
            state = self.activate()

        if state == OnchainState.ACTIVE_REGISTRATION:
            state = self.register()

        if state == OnchainState.FINISHED_REGISTRATION:
            reuse_multisig = is_update
            state = self.deploy(reuse_multisig)

        return state == OnchainState.DEPLOYED