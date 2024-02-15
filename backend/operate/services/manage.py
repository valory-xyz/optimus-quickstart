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
from autonomy.deploy.constants import (
    AGENT_KEYS_DIR,
    BENCHMARKS_DIR,
    LOG_DIR,
    PERSISTENT_DATA_DIR,
    TM_STATE_DIR,
    VENVS_DIR,
)
from operate.http import Resource
from operate.keys import Keys
from operate.ledger.profiles import CONTRACTS
from operate.services.protocol import OnChainManager
from operate.services.service import Service
from operate.types import (
    ChainData,
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

    def create(self, data: PostServices) -> PostServices:
        """Create a service."""
        phash = data["hash"]
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
        deployment = service.helper.deployment_config()
        instances = [
            self.keys.create() for _ in range(service.helper.config.number_of_agents)
        ]
        ocm = OnChainManager(
            rpc=data["rpc"],
            key=self.key,
            contracts=CONTRACTS[ledger["chain"]],
        )

        # Update to user provided RPC
        ledger["rpc"] = data["rpc"]

        logging.info(f"Minting service {phash}")
        service_id = t.cast(
            int,
            ocm.mint(
                package_path=service.service_path,
                agent_id=deployment["chain"]["agent_id"],
                number_of_slots=service.helper.config.number_of_agents,
                cost_of_bond=deployment["chain"]["cost_of_bond"],
                threshold=deployment["chain"]["threshold"],
                nft=IPFSHash(deployment["chain"]["nft"]),
            ).get("token"),
        )

        logging.info(f"Activating service {phash}")
        ocm.activate(service_id=service_id)
        ocm.register(
            service_id=service_id,
            instances=instances,
            agents=[deployment["chain"]["agent_id"] for _ in instances],
        )

        logging.info(f"Deploying service {phash}")
        ocm.deploy(service_id=service_id)

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

        logging.info(f"Building deployment for service {phash}")
        deployment = service.deployment()
        deployment.create({})
        deployment.store()

        return service.json

    def update(self, data: PutServices) -> ServiceType:
        """Update service using a template."""
        # NOTE: This method contains a lot of repetative code

        # Load old service
        old = Service.load(path=self.path / data["old"])

        rpc = data["new"]["rpc"]
        phash = data["new"]["hash"]

        if (self.path / phash).exists():  # For testing only
            shutil.rmtree(self.path / phash)

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

        logging.info(f"Fetching service {phash}")
        service = Service.new(
            path=self.path,
            phash=phash,
            keys=[],
            chain_data=ChainData(),
            ledger={},
        )

        ledger = service.helper.ledger_config()
        deployment = service.helper.deployment_config()

        # Update to user provided RPC
        ledger["rpc"] = data["new"]["rpc"]

        logging.info(f"Minting service {phash}")
        service_id = t.cast(
            int,
            ocm.mint(
                package_path=service.service_path,
                agent_id=deployment["chain"]["agent_id"],
                number_of_slots=service.helper.config.number_of_agents,
                cost_of_bond=deployment["chain"]["cost_of_bond"],
                threshold=deployment["chain"]["threshold"],
                nft=IPFSHash(deployment["chain"]["nft"]),
                update_token=old.chain_data["token"],
            ).get("token"),
        )

        logging.info(f"Activating service {phash}")
        ocm.activate(service_id=service_id)
        ocm.register(
            service_id=service_id,
            instances=instances,
            agents=[deployment["chain"]["agent_id"] for _ in instances],
        )

        logging.info(f"Deploying service {phash}")
        ocm.deploy(
            service_id=service_id,
            reuse_multisig=True,
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

        # Build docker-compose deployment
        deployment = service.deployment()
        deployment.create({})
        deployment.store()

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
