#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2021-2024 Valory AG
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
"""This module implements the service manager class."""

import json
import logging
import os
import shutil
import typing as t
from pathlib import Path
import docker
import itertools
from aea.helpers.yaml_utils import yaml_dump, yaml_load, yaml_load_all
from aea_cli_ipfs.ipfs_utils import IPFSTool
from aea_ledger_ethereum.ethereum import EthereumCrypto
from autonomy.chain.config import ChainType
from autonomy.cli.helpers.deployment import run_deployment, stop_deployment
from autonomy.deploy.base import ServiceBuilder
from autonomy.deploy.constants import (
    AGENT_KEYS_DIR,
    BENCHMARKS_DIR,
    LOG_DIR,
    PERSISTENT_DATA_DIR,
    TM_STATE_DIR,
    VENVS_DIR,
)
from autonomy.deploy.generators.docker_compose.base import DockerComposeGenerator
from protocol import OnChainManager, OnchainState
from enum import Enum
import yaml
from repo import Repo
from gnosis.eth import EthereumClient
from gnosis.safe import Safe
import shutil

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


class ServiceState(Enum):
    """
    Service state
    """

    NON_EXISTENT = 0
    PRE_REGISTRATION = 1
    ACTIVE_REGISTRATION = 2
    FINISHED_REGISTRATION = 3
    DEPLOYED = 4
    TERMINATED_BONDED = 5


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


class ServiceManager:
    """Service manager."""

    def __init__(self, path: t.Optional[Path] = None) -> None:
        """Initialize object."""
        self._path = path or Path.cwd() / OPERATE
        self._services = self._path / SERVICES
        self._keys = self._path / KEYS
        self._key = self._path / KEY
        self.make()

        self.keys = KeysManager(path=self._keys)
        self.docker_client = docker.from_env()

    def make(self) -> None:
        """Make the root directory."""
        self._path.mkdir(exist_ok=True)
        self._services.mkdir(exist_ok=True)
        self._keys.mkdir(exist_ok=True)
        if not self._key.exists():
            self._key.write_bytes(EthereumCrypto().private_key.encode())

    def get(self, phash: str) -> t.Dict:
        """Get service."""
        return json.loads((self._services / phash / CONFIG).read_text(encoding="utf-8"))

    def get_config(self, phash: str, name: str) -> t.Dict:
        """Get service config."""
        with open(self._services / phash / name / SERVICE_YAML, "r") as config_file:
            return [doc for doc in yaml.safe_load_all(config_file)]

    def get_deployment(self, phash: str) -> Path:
        """Get the deployment path"""
        return self._services / phash / DEPLOYMENT

    def has_deployment(self, phash: str) -> bool:
        """Check whether a deployment exists"""
        return self.get_deployment(phash).is_dir()

    def store(self, service: t.Dict) -> None:
        """Store service."""
        (self._services / str(service["hash"]) / CONFIG).write_text(
            json.dumps(
                service,
                indent=4,
            )
        )

    def update_store(self, phash, **kwargs) -> None:
        """Store service."""
        data = self.get(phash)
        data.update(**kwargs)
        (self._services / phash / CONFIG).write_text(
            json.dumps(
                data,
                indent=4,
            )
        )

    def info(
        self,
        token_id,
        rpc: str,
        custom_addresses: t.Optional[t.Dict] = None,
    ):
        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )
        return manager.info(token_id)

    def fetch(self, phash: str) -> t.Dict:
        """Fetch service to local storage."""
        spath = self._services / phash

        # TODO: Remove later
        if spath.exists():
            return self.get(phash=phash)

        spath.mkdir()
        downloaded = IPFSTool().download(
            hash_id=phash,
            target_dir=spath,
        )

        with Path(downloaded, "service.yaml").open("r", encoding="utf-8") as fp:
            config, *_ = yaml_load_all(fp)
            name = config["author"] + "/" + config["name"]

        self.store(
            dict(
                name=name,
                hash=phash,
                service=downloaded,
            )
        )

        return self.get(phash=phash)

    def update(self, new: str, old: str) -> t.Dict:
        """Update a service."""
        service_old = self.get(phash=old)
        service = self.fetch(phash=new)

        service["token"] = service_old.get("token")
        service["multisig"] = service_old.get("multisig")
        service["instances"] = service_old.get("instances")

    def build(
        self,
        phash: str,
        environment: str,
        keys: t.Optional[t.List[str]] = None,
        volumes: t.Optional[t.Dict[str, str]] = None,
    ) -> None:
        """Build deployment setup."""
        service = self.get(phash=phash)
        build = self._services / phash / DEPLOYMENT
        if build.exists():
            shutil.rmtree(build)

        build.mkdir()
        build_dirs(build_dir=build)
        if keys is None and len(service.get("instances", [])) == 0:
            raise ValueError(
                "Please provide keys or make sure service is deployed on-chain"
            )

        keys_file = self._services / phash / KEYS_JSON
        if keys is None:
            keys = service["instances"]
        key_objs = [self.keys.get(key=key) for key in keys]
        keys_file.write_text(json.dumps(key_objs, indent=4), encoding="utf-8")

        # Update environment
        _environ = dict(os.environ)
        os.environ.update(environment)

        try:
            builder = ServiceBuilder.from_dir(
                path=Path(service["service"]),
                keys_file=keys_file,
                number_of_agents=len(keys),
            )
            builder.deplopyment_type = DockerComposeGenerator.deployment_type
            builder.try_update_abci_connection_params()
            builder.try_update_runtime_params(
                multisig_address=service.get("multisig"),
                agent_instances=service.get("instances"),
                consensus_threshold=None,
            )

            # build deployment
            (
                DockerComposeGenerator(
                    service_builder=builder,
                    build_dir=build,
                    use_tm_testnet_setup=True,
                )
                .generate()
                .generate_config_tendermint()
                .write_config()
                .populate_private_keys()
            )
        except Exception:
            shutil.rmtree(build)
            raise
        finally:
            os.environ.clear()
            os.environ.update(_environ)

        if volumes is not None:
            compose = build / DOCKER_COMPOSE_YAML
            _volumes = []
            for volume, mount in volumes.items():
                (build / volume).mkdir(exist_ok=True)
                _volumes.append(f"./{volume}:{mount}:Z")
            with compose.open("r", encoding="utf-8") as stream:
                deployment = yaml_load(stream=stream)
            for service in deployment["services"]:
                if "abci" in service:
                    deployment["services"][service]["volumes"].extend(_volumes)
            with compose.open("w", encoding="utf-8") as stream:
                yaml_dump(data=deployment, stream=stream)

    def start(self, phash: str) -> t.Dict:
        """Deploy a service."""
        run_deployment(build_dir=self._services / phash / DEPLOYMENT, detach=True)

    def stop(self, phash: str) -> t.Dict:
        """Stop a service."""
        stop_deployment(build_dir=self._services / phash / DEPLOYMENT)

    def mint(
        self,
        phash: str,
        agent_id: int,
        number_of_slots: int,
        cost_of_bond: int,
        threshold: int,
        nft: t.Any,
        rpc: str,
        update_token: t.Optional[int] = None,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> None:
        """Mint a service on-chain."""
        service = self.get(phash=phash)
        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )
        published = manager.mint(
            package_path=Path(service["service"]),
            agent_id=agent_id,
            number_of_slots=number_of_slots,
            cost_of_bond=cost_of_bond,
            threshold=threshold,
            nft=nft,
            update_token=update_token,
        )
        service["token"] = published["token"]
        self.store(service=service)
        return published

    def activate(
        self,
        phash: str,
        rpc: str,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> None:
        """Activate service on-chain."""
        service = self.get(phash=phash)
        if "token" not in service:
            raise ValueError("Cannot activate service, mint first")

        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )

        manager.activate(
            service_id=service["token"],
            token=None,
        )

    def register(
        self,
        phash: str,
        instances: t.List[str],
        agents: t.List[int],
        rpc: str,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> None:
        """Register agent instances on-chain."""
        service = self.get(phash=phash)
        if "token" not in service:
            raise ValueError("Cannot activate service, mint first")

        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )

        manager.register(
            service_id=service["token"],
            instances=instances,
            agents=agents,
            token=None,
        )

    def deploy(
        self,
        phash: str,
        rpc: str,
        reuse_multisig: bool = False,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> t.Dict:
        """Deploy service on-chain."""
        service = self.get(phash=phash)
        if "token" not in service:
            raise ValueError("Cannot activate service, mint first")

        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )

        manager.deploy(
            service_id=service["token"],
            reuse_multisig=reuse_multisig,
            token=None,
        )

        info = manager.info(token_id=service["token"])
        service["multisig"] = info["multisig_address"]
        service["instances"] = info["instances"]
        self.store(service=service)
        return info

    def terminate(
        self,
        phash: str,
        rpc: str,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> t.Dict:
        """Deploy service on-chain."""
        service = self.get(phash=phash)
        if "token" not in service:
            raise ValueError("Cannot activate service, mint first")
        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )
        manager.terminate(service_id=service["token"])
        self.store(service=service)

    def unbond(
        self,
        phash: str,
        rpc: str,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> t.Dict:
        """Deploy service on-chain."""
        service = self.get(phash=phash)
        if "token" not in service:
            raise ValueError("Cannot activate service, mint first")
        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )
        manager.unbond(service_id=service["token"])

    def swap(
        self,
        phash: str,
        rpc: str,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> t.Dict:
        """Swap owner agent owner with user as safe owner."""
        service = self.get(phash=phash)
        if "multisig" not in service:
            raise ValueError("Cannot swap service")

        manager = OnChainManager(
            rpc=rpc,
            key=self._key,
            chain_type=ChainType.CUSTOM,
            custom_addresses=custom_addresses or {},
        )

        (owner,) = service["instances"]

        manager.swap(
            service_id=service["token"],
            multisig=service["multisig"],
            owner_key=self.keys.get(key=owner).get("private_key"),
        )


    def is_running(self, service_hash: str) -> bool:
        """Check whether a service is running"""
        running_tags = list(set(itertools.chain.from_iterable([
            container.image.tags for container in self.docker_client.containers.list()
        ])))

        service_author, service_name = self.get(service_hash)["name"].split("/")
        config = self.get_config(service_hash, service_name)
        agent_hash = config[0]["agent"].split(":")[-1]
        service_tag = f"{service_author}/oar-{service_name}:{agent_hash}"
        return service_tag in running_tags


    def is_built(self, service_hash: str) -> bool:
        """Check whether a service is built"""
        return (self._services / service_hash / DEPLOYMENT).is_dir()


    def get_state(self, phash: str, custom_addresses: t.Optional[t.Dict]) -> OnchainState:
        """Get the onchain state"""
        service = self.get(phash=phash)
        info = self.info(
            token_id=service["token"],
            rpc=service["rpc"],
            custom_addresses=custom_addresses or {},
        )
        return OnchainState(info["service_state"])

    def is_updatable(self, service_hash: str, repo_str: str) -> bool:
        """Check if the service is updatable"""
        repo = Repo(repo_str)
        latest_hash = repo.get_service_hash()
        return service_hash != latest_hash

    def update_service(
        self,
        service_hash: str,
        service_config: dict,
        custom_addresses: t.Optional[t.Dict] = None,
    ) -> t.Optional[str]:
        """Update the service to the latest version"""
        service = self.get(service_hash)
        repo = Repo(service_config["repository"])
        latest_hash = repo.get_service_hash()

        if not latest_hash:
            return None

        if service_hash == latest_hash:
            return None

        # Fetch the new service
        self.fetch(latest_hash)

        rpc = service["rpc"]

        safe_owners = Safe(
            service["multisig"],
            EthereumClient(rpc)
        ).retrieve_all_info().owners

        # Run the onchain update
        if self.get_state(latest_hash, custom_addresses) == OnchainState.DEPLOYED and safe_owners == service["instances"]:
            self.swap(  # TODO: ensure this swaps the multisig back to the operator (master key)
                phash=service_hash,
                rpc=rpc,
                custom_addresses=custom_addresses,
            )

        if self.get_state(latest_hash, custom_addresses) == OnchainState.DEPLOYED:
            self.terminate(
                service_hash,
                rpc,
                custom_addresses
            )

        if self.get_state(latest_hash, custom_addresses) == OnchainState.TERMINATED_BONDED:
            self.unbond(
                service_hash,
                rpc,
                custom_addresses
            )

        if self.get_state(latest_hash, custom_addresses) == OnchainState.PRE_REGISTRATION:
            self.mint(
                service_hash,
                service_config["agent_id"],
                service_config["number_of_slots"],
                service_config["cost_of_bond"],
                service_config["threshold"],
                service_config["nft"],
                rpc,
                service["token"], # TODO: same token as before?
                custom_addresses
            )

        if self.get_state(latest_hash, custom_addresses) == OnchainState.PRE_REGISTRATION:
            self.activate(
                service_hash,
                rpc,
                custom_addresses
            )

        if self.get_state(latest_hash, custom_addresses) == OnchainState.ACTIVE_REGISTRATION:
            self.register(
                service_hash,
                service["instances"],
                [service_config["agent_id"]],
                rpc,
                custom_addresses,
            )

        if self.get_state(latest_hash, custom_addresses) == OnchainState.FINISHED_REGISTRATION:
            self.deploy(
                service_hash,
                rpc,
                True,
                custom_addresses,
            )

        # Check that the service is deployed
        if self.get_state(latest_hash, custom_addresses) != OnchainState.DEPLOYED:
            return None

        # Copy keys and config from the current service
        shutil.copy(
            self._services / service_hash / KEYS_JSON,
            self._services / latest_hash / KEYS_JSON
        )

        # Build the new deployment
        self.build(
            phash=latest_hash,
            environment={},
            volumes={"data": "/data"},
        )

        # Remove previous build
        # TODO: pending tm permission issues

        return latest_hash