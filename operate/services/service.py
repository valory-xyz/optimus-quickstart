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

"""Service as HTTP resource."""

import json
import os
import shutil
import typing as t
from copy import deepcopy
from dataclasses import dataclass
from pathlib import Path

from aea.configurations.data_types import PackageType
from aea.helpers.yaml_utils import yaml_dump, yaml_load, yaml_load_all
from aea_cli_ipfs.ipfs_utils import IPFSTool
from autonomy.cli.helpers.deployment import run_deployment, stop_deployment
from autonomy.configurations.loader import load_service_config
from autonomy.deploy.base import ServiceBuilder as BaseServiceBuilder
from autonomy.deploy.constants import (
    AGENT_KEYS_DIR,
    BENCHMARKS_DIR,
    LOG_DIR,
    PERSISTENT_DATA_DIR,
    TM_STATE_DIR,
    VENVS_DIR,
)
from autonomy.deploy.generators.docker_compose.base import DockerComposeGenerator
from docker import from_env

from operate.constants import (
    DEPLOYMENT,
    DEPLOYMENT_JSON,
    DOCKER_COMPOSE_YAML,
    KEYS_JSON,
)
from operate.http.exceptions import NotAllowed
from operate.keys import Keys
from operate.resource import LocalResource
from operate.types import (
    ChainType,
    DeployedNodes,
    DeploymentConfig,
    DeploymentStatus,
    LedgerConfig,
    LedgerType,
    OnChainData,
    OnChainState,
    OnChainUserParams,
)


# pylint: disable=no-member,redefined-builtin,too-many-instance-attributes

DUMMY_MULTISIG = "0xm"


def mkdirs(build_dir: Path) -> None:
    """Build necessary directories."""
    build_dir.mkdir(exist_ok=True)
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


def remove_service_network(service_name: str, force: bool = True) -> None:
    """Remove service network cache."""
    client = from_env()
    network_names = (
        f"deployment_service_{service_name}_localnet",
        f"abci_build_service_{service_name}_localnet",
    )
    for network in client.networks.list(greedy=True):
        if network.attrs["Name"] not in network_names:
            continue

        if force:
            for container in network.attrs["Containers"]:
                print(f"Killing {container}")
                client.api.kill(container=container)

        print("Deleting network: " + network.attrs["Name"])
        client.api.remove_network(net_id=network.attrs["Id"])


# TODO: Backport to autonomy
class ServiceBuilder(BaseServiceBuilder):
    """Service builder patch."""

    def try_update_ledger_params(self, chain: str, address: str) -> None:
        """Try to update the ledger params."""

        for override in deepcopy(self.service.overrides):
            (
                override,
                component_id,
                _,
            ) = self.service.process_metadata(
                configuration=override,
            )

            if (
                component_id.package_type == PackageType.CONNECTION
                and component_id.name == "ledger"
            ):
                ledger_connection_overrides = deepcopy(override)
                break
        else:
            return

        # TODO: Support for multiple overrides
        ledger_connection_overrides["config"]["ledger_apis"][chain]["address"] = address
        service_overrides = deepcopy(self.service.overrides)
        service_overrides = [
            override
            for override in service_overrides
            if override["public_id"] != str(component_id.public_id)
            or override["type"] != PackageType.CONNECTION.value
        ]

        ledger_connection_overrides["type"] = PackageType.CONNECTION.value
        ledger_connection_overrides["public_id"] = str(component_id.public_id)
        service_overrides.append(ledger_connection_overrides)
        self.service.overrides = service_overrides


class ServiceHelper:
    """Service config helper."""

    def __init__(self, path: Path) -> None:
        """Initialize object."""
        self.path = path
        self.config = load_service_config(service_path=path)

    def ledger_config(self) -> "LedgerConfig":
        """Get ledger config."""
        # TODO: Multiledger/Multiagent support
        for override in self.config.overrides:
            if (
                override["type"] == "connection"
                and "valory/ledger" in override["public_id"]
            ):
                (_, config), *_ = override["config"]["ledger_apis"].items()
                return LedgerConfig(
                    rpc=config["address"],
                    chain=ChainType.from_id(cid=config["chain_id"]),
                    type=LedgerType.ETHEREUM,
                )
        raise ValueError("No ledger config found.")

    def deployment_config(self) -> DeploymentConfig:
        """Returns deployment config."""
        return DeploymentConfig(self.config.json.get("deployment", {}))  # type: ignore


@dataclass
class Deployment(LocalResource):
    """Deployment resource for a service."""

    status: DeploymentStatus
    nodes: DeployedNodes
    path: Path

    _file = "deployment.json"

    @staticmethod
    def new(path: Path) -> "Deployment":
        """
        Create a new deployment

        :param path: Path to service
        """
        deployment = Deployment(
            status=DeploymentStatus.CREATED,
            nodes=DeployedNodes(agent=[], tendermint=[]),
            path=path,
        )
        deployment.store()
        return deployment

    @classmethod
    def load(cls, path: Path) -> "Deployment":
        """Load a service"""
        return super().load(path)  # type: ignore

    def build(self, force: bool = True) -> None:
        """
        Build a deployment

        :param force: Remove existing deployment and build a new one
        :return: Deployment object
        """
        service = Service.load(path=self.path)
        # Remove network from cache if exists, this will raise an error
        # if the service is still running so we can do an early exit
        remove_service_network(
            service_name=service.helper.config.name,
            force=force,
        )

        build = self.path / DEPLOYMENT
        if build.exists() and not force:
            return
        if build.exists() and force:
            shutil.rmtree(build)
        mkdirs(build_dir=build)

        keys_file = self.path / KEYS_JSON
        keys_file.write_text(
            json.dumps(
                [
                    {
                        "address": key.address,
                        "private_key": key.private_key,
                        "ledger": key.ledger.name.lower(),
                    }
                    for key in service.keys
                ],
                indent=4,
            ),
            encoding="utf-8",
        )
        try:
            builder = ServiceBuilder.from_dir(
                path=service.service_path,
                keys_file=keys_file,
                number_of_agents=len(service.keys),
            )
            builder.deplopyment_type = DockerComposeGenerator.deployment_type
            builder.try_update_abci_connection_params()
            builder.try_update_runtime_params(
                multisig_address=service.chain_data.multisig,
                agent_instances=service.chain_data.instances,
                consensus_threshold=None,
            )
            # TODO: Support for multiledger
            builder.try_update_ledger_params(
                chain=LedgerType(service.ledger_config.type).name.lower(),
                address=service.ledger_config.rpc,
            )

            # build deployment
            (
                DockerComposeGenerator(
                    service_builder=builder,
                    build_dir=build.resolve(),
                    use_tm_testnet_setup=True,
                )
                .generate()
                .generate_config_tendermint()
                .write_config()
                .populate_private_keys()
            )
        except Exception as e:
            shutil.rmtree(build)
            raise e

        with (build / DOCKER_COMPOSE_YAML).open("r", encoding="utf-8") as stream:
            deployment = yaml_load(stream=stream)

        self.nodes = DeployedNodes(
            agent=[
                service for service in deployment["services"] if "_abci_" in service
            ],
            tendermint=[
                service for service in deployment["services"] if "_tm_" in service
            ],
        )

        _volumes = []
        for volume, mount in (
            service.helper.deployment_config().get("volumes", {}).items()
        ):
            (build / volume).mkdir(exist_ok=True)
            _volumes.append(f"./{volume}:{mount}:Z")

        for node in deployment["services"]:
            if "abci" in node:
                deployment["services"][node]["volumes"].extend(_volumes)

        with (build / DOCKER_COMPOSE_YAML).open("w", encoding="utf-8") as stream:
            yaml_dump(data=deployment, stream=stream)

        self.status = DeploymentStatus.BUILT
        self.store()

    def start(self) -> None:
        """Start the service"""
        if self.status != DeploymentStatus.BUILT:
            raise NotAllowed(
                f"The deployment is in {self.status}; It needs to be in {DeploymentStatus.BUILT} status"
            )

        self.status = DeploymentStatus.DEPLOYING
        self.store()

        build = self.path / "deployment"
        run_deployment(build_dir=build, detach=True)

        self.status = DeploymentStatus.DEPLOYED
        self.store()

    def stop(self) -> None:
        """Stop the deployment."""
        if self.status != DeploymentStatus.DEPLOYED:
            return

        self.status = DeploymentStatus.STOPPING
        self.store()

        # Stop the docker deployment
        stop_deployment(build_dir=self.path / "deployment")

        self.status = DeploymentStatus.BUILT
        self.store()

    def delete(self) -> None:
        """Delete the deployment."""
        shutil.rmtree(self.path / "deployment")
        self.status = DeploymentStatus.DELETED
        self.store()


@dataclass
class Service(LocalResource):
    """Service class."""

    hash: str
    keys: Keys
    ledger_config: LedgerConfig
    chain_data: OnChainData

    path: Path
    service_path: Path

    name: t.Optional[str] = None

    _helper: t.Optional[ServiceHelper] = None
    _deployment: t.Optional[Deployment] = None

    _file = "config.json"

    @classmethod
    def load(cls, path: Path) -> "Service":
        """Load a service"""
        return super().load(path)  # type: ignore

    @property
    def helper(self) -> ServiceHelper:
        """Get service helper."""
        if self._helper is None:
            self._helper = ServiceHelper(path=self.service_path)
        return t.cast(ServiceHelper, self._helper)

    @property
    def deployment(self) -> Deployment:
        """Load deployment object for the service."""
        if not (self.path / DEPLOYMENT_JSON).exists():
            self._deployment = Deployment.new(path=self.path)
        if self._deployment is None:
            self._deployment = Deployment.load(path=self.path)
        return t.cast(Deployment, self._deployment)

    @staticmethod
    def new(
        hash: str,
        keys: Keys,
        rpc: str,
        on_chain_user_params: OnChainUserParams,
        storage: Path,
    ) -> "Service":
        """Create a new service."""
        path = storage / hash
        path.mkdir()
        service_path = Path(
            IPFSTool().download(
                hash_id=hash,
                target_dir=path,
            )
        )
        with (service_path / "service.yaml").open("r", encoding="utf-8") as fp:
            config, *_ = yaml_load_all(fp)

        ledger_config = ServiceHelper(path=service_path).ledger_config()
        service = Service(
            name=config["author"] + "/" + config["name"],
            hash=hash,
            keys=keys,
            ledger_config=LedgerConfig(
                rpc=rpc,
                type=ledger_config.type,
                chain=ledger_config.chain,
            ),
            chain_data=OnChainData(
                instances=[],
                token=-1,
                multisig=DUMMY_MULTISIG,
                staked=False,
                on_chain_state=OnChainState.NOTMINTED,
                user_params=on_chain_user_params,
            ),
            path=service_path.parent,
            service_path=service_path,
        )
        service.store()
        return service

    def delete(self) -> None:
        """Delete a service."""
        shutil.rmtree(self.path)
