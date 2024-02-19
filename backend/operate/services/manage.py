#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2024 Valory AG
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
"""Service manager."""

import logging
import os
import shutil
import typing as t
from pathlib import Path

from aea.helpers.base import IPFSHash
from autonomy.chain.base import registry_contracts
from autonomy.deploy.constants import (
    AGENT_KEYS_DIR,
    BENCHMARKS_DIR,
    LOG_DIR,
    PERSISTENT_DATA_DIR,
    TM_STATE_DIR,
    VENVS_DIR,
)
from operate.http import Resource
from operate.http.exceptions import BadRequest
from operate.keys import Keys
from operate.ledger.profiles import CONTRACTS, OLAS, STAKING
from operate.services.protocol import OnChainManager
from operate.services.service import Service
from operate.types import (
    ChainData,
    ConfigurationTemplate,
    ServicesType,
    ServiceTemplate,
    ServiceType,
)
from starlette.types import Receive, Scope, Send
from typing_extensions import TypedDict

OPERATE = ".operate"
CONFIG = "config.json"
SERVICES = "services"
KEYS = "keys"
DEPLOYMENT = "deployment"
CONFIG = "config.json"
KEY = "master-key.txt"
KEYS_JSON = "keys.json"
DOCKER_COMPOSE_YAML = "docker-compose.yaml"
SERVICE_YAML = "service.yaml"


def build_dirs(build_dir: Path) -> None:
    """Build necessary directories."""

    for dir_path in [
        (PERSISTENT_DATA_DIR,),
        (PERSISTENT_DATA_DIR, LOG_DIR),
        (PERSISTENT_DATA_DIR, TM_STATE_DIR),
        (PERSISTENT_DATA_DIR, BENCHMARKS_DIR),
        (PERSISTENT_DATA_DIR, VENVS_DIR),
        (AGENT_KEYS_DIR,),
    ]:
        path = Path(build_dir, *dir_path)
        path.mkdir()
        try:
            os.chown(path, 1000, 1000)
        except (PermissionError, AttributeError):
            continue


class GetServices(ServicesType):
    """Get payload."""


class PostServices(ServiceTemplate):
    """Create payload."""


class PutServices(TypedDict):
    """Create payload."""

    old: str
    new: ServiceTemplate


class DeleteServicesPayload(TypedDict):
    """Create payload."""

    hashes: t.List[str]


class DeleteServicesResponse(TypedDict):
    """Create payload."""

    hashes: t.List[str]


class Services(
    Resource[
        GetServices,
        PostServices,
        ServiceType,
        PutServices,
        ServiceType,
        DeleteServicesPayload,
        ServicesType,
    ]
):
    """Services resource."""

    def __init__(self, path: Path, keys: Keys, key: Path) -> None:
        """Initialze object."""
        super().__init__()
        self.path = path
        self.keys = keys
        self.key = key

    async def access(
        self,
        params: t.Dict,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        """Access service resource."""
        resource = Service.load(self.path / params.pop("service"))
        await resource(scope=scope, receive=receive, send=send)

    @property
    def json(self) -> GetServices:
        """Returns the list of available services."""
        data = []
        for service in self.path.iterdir():
            data.append(Service.load(path=service).json)
        return data

    def _stake(self) -> None:
        """Stake a service."""

    def _create(
        self,
        phash: str,
        configuration: ConfigurationTemplate,
        instances: t.Optional[t.List[str]] = None,
        update_token: t.Optional[int] = None,
        reuse_multisig: bool = False,
    ) -> Service:
        """Create a new service."""
        if (self.path / phash).exists():  # For testing only
            shutil.rmtree(self.path / phash)

        logging.info(f"Fetching service {phash}")
        service = Service.new(
            path=self.path,
            phash=phash,
            keys=[],
            chain_data=ChainData(),
            ledger={},
        )

        ledger = service.helper.ledger_config()
        instances = instances or [
            self.keys.create() for _ in range(service.helper.config.number_of_agents)
        ]
        ocm = OnChainManager(
            rpc=configuration["rpc"],
            key=self.key,
            contracts=CONTRACTS[ledger["chain"]],
        )

        if configuration["use_staking"] and not ocm.staking_slots_available(
            staking_contract=STAKING[ledger["chain"]]
        ):
            raise ValueError("No staking slots available")

        if configuration["use_staking"]:
            required_olas = (
                configuration["olas_cost_of_bond"]
                + configuration["olas_required_to_stake"]
            )
            balance = (
                registry_contracts.erc20.get_instance(
                    ledger_api=ocm.ledger_api,
                    contract_address=OLAS[ledger["chain"]],
                )
                .functions.balanceOf(ocm.crypto.address)
                .call()
            )

            if balance < required_olas:
                raise BadRequest(
                    "You don't have enough olas to stake, "
                    f"required olas: {required_olas}; your balance {balance}"
                )

        # Update to user provided RPC
        ledger["rpc"] = configuration["rpc"]

        logging.info(f"Minting service {phash}")
        service_id = t.cast(
            int,
            ocm.mint(
                package_path=service.service_path,
                agent_id=configuration["agent_id"],
                number_of_slots=service.helper.config.number_of_agents,
                cost_of_bond=(
                    configuration["olas_cost_of_bond"]
                    if configuration["use_staking"]
                    else configuration["cost_of_bond"]
                ),
                threshold=configuration["threshold"],
                nft=IPFSHash(configuration["nft"]),
                update_token=update_token,
                token=OLAS[ledger["chain"]] if configuration["use_staking"] else None,
            ).get("token"),
        )

        logging.info(f"Activating service {phash}")
        ocm.activate(
            service_id=service_id,
            token=OLAS[ledger["chain"]] if configuration["use_staking"] else None,
        )
        ocm.register(
            service_id=service_id,
            instances=instances,
            agents=[configuration["agent_id"] for _ in instances],
            token=OLAS[ledger["chain"]] if configuration["use_staking"] else None,
        )

        logging.info(f"Deploying service {phash}")
        ocm.deploy(
            service_id=service_id,
            reuse_multisig=reuse_multisig,
            token=OLAS[ledger["chain"]] if configuration["use_staking"] else None,
        )

        logging.info(f"Updating service {phash}")
        info = ocm.info(token_id=service_id)
        service.ledger = ledger
        service.keys = [self.keys.get(key=key) for key in instances]
        service.chain_data = ChainData(
            {
                "token": service_id,
                "instances": info["instances"],
                "multisig": info["multisig"],
            }
        )
        service.store()

        if configuration["use_staking"]:
            ocm.stake(
                service_id=service_id,
                service_registry=CONTRACTS[ledger["chain"]]["service_registry"],
                staking_contract=STAKING[ledger["chain"]],
            )

        logging.info(f"Building deployment for service {phash}")
        deployment = service.deployment()
        deployment.create({})
        deployment.store()

        return service

    def create(self, data: PostServices) -> PostServices:
        """Create a service."""
        service = self._create(
            phash=data["hash"],
            configuration=data["configuration"],
        )
        return service.json

    def update(self, data: PutServices) -> ServiceType:
        """Update service using a template."""
        # NOTE: This method contains a lot of repetative code
        rpc = data["new"]["configuration"]["rpc"]
        phash = data["new"]["hash"]
        if (self.path / phash).exists():  # For testing only
            shutil.rmtree(self.path / phash)

        # Load old service
        old = Service.load(path=self.path / data["old"])
        instances = old.chain_data["instances"]
        ocm = OnChainManager(
            rpc=rpc,
            key=self.key,
            contracts=CONTRACTS[old.ledger["chain"]],
        )

        # Terminate old service
        ocm.terminate(
            service_id=old.chain_data["token"],
        )

        # Unbond old service
        ocm.unbond(
            service_id=old.chain_data["token"],
        )

        # Swap owners on the old safe
        owner, *_ = old.chain_data["instances"]
        owner_key = self.keys.get(owner).get("private_key")
        ocm.swap(
            service_id=old.chain_data["token"],
            multisig=old.chain_data["multisig"],
            owner_key=owner_key,
        )
        service = self._create(
            phash=phash,
            configuration=data["new"]["configuration"],
            instances=instances,
            reuse_multisig=True,
            update_token=old.chain_data["token"],
        )

        # try:
        #     shutil.rmtree(old.path)
        # except Exception as e:
        #     print(e)

        return service.json

    def delete(self, data: DeleteServicesPayload) -> ServicesType:
        """Delete services."""
        for shash in data["hashes"]:
            service = Service.load(path=self.path / shash)
            service.delete(data={})
        return self.json
