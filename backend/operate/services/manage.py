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

import json
import logging
import os
import shutil
import typing as t
from pathlib import Path

from aea.helpers.base import IPFSHash
from aea_ledger_ethereum.ethereum import EthereumCrypto
from autonomy.chain.config import ChainType
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
from operate.services.protocol import OnChainManager
from operate.services.service import Service
from operate.types import (
    ChainData,
    DeploymentConfig,
    ServicesType,
    ServiceTemplate,
    ServiceType,
)
from starlette.types import Receive, Scope, Send
from typing_extensions import TypedDict

logging.basicConfig(level=logging.DEBUG)

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


class KeysManager:
    """Keys manager."""

    def __init__(self, path: Path) -> None:
        """Initialize object."""
        self._path = path

    def get(self, key: str) -> t.Dict:
        """Get key object."""
        return json.loads((self._path / key).read_text(encoding="utf-8"))

    def create(self, name=None) -> str:
        """Creates new key."""
        crypto = EthereumCrypto()
        name = name or crypto.address
        key_path = self._path / name

        if key_path.is_file():
            return crypto.address

        key_path.write_text(
            json.dumps(
                {
                    "address": crypto.address,
                    "private_key": crypto.private_key,
                    "ledger": "ethereum",
                },
                indent=4,
            ),
            encoding="utf-8",
        )
        return crypto.address

    def delete(self, key: str) -> None:
        """Delete key."""
        os.remove(self._path / key)


class GetServices(ServicesType):
    """Get payload."""


class PostServices(ServiceTemplate):
    """Create payload."""


class PutServices(TypedDict):
    """Create payload."""


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
        instances = [self.keys.create() for _ in range(data.get("number_of_agents", 1))]
        keys = [self.keys.get(key=key) for key in instances]
        rpc = data["ledger"]["rpc"]
        contracts = data["ledger"]["contracts"]
        phash = data["hash"]

        if (self.path / phash).exists():
            shutil.rmtree(self.path / phash)

        service = Service.new(
            path=self.path,
            phash=phash,
            keys=keys,
            chain_data=ChainData(),
            deployment_config=DeploymentConfig(
                {
                    "variables": data["deployments"]["local"]["variables"],
                    "volumes": data["deployments"]["local"]["volumes"],
                }
            ),
            ledger=data["ledger"],
        )

        ocm = OnChainManager(
            rpc=rpc,
            key=self.key,
            chain_type=ChainType.CUSTOM,
            contracts=contracts,
        )

        # Mint service on-chain
        service_id = t.cast(
            int,
            ocm.mint(
                package_path=service.service_path,
                agent_id=data["deployments"]["chain"]["agent_id"],
                number_of_slots=data["number_of_agents"],
                cost_of_bond=data["deployments"]["chain"]["cost_of_bond"],
                threshold=data["deployments"]["chain"]["threshold"],
                nft=IPFSHash(data["deployments"]["chain"]["nft"]),
            ).get("token"),
        )
        ocm.activate(service_id=service_id)
        ocm.register(
            service_id=service_id,
            instances=instances,
            agents=[data["deployments"]["chain"]["agent_id"] for _ in instances],
        )
        ocm.deploy(service_id=service_id)
        info = ocm.info(token_id=service_id)
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

        return service.json

    def delete(self, data: DeleteServicesPayload) -> ServicesType:
        """Delete services."""
        for shash in data["hashes"]:
            service = Service.load(path=self.path / shash)
            service.delete(data={})
        return self.json
