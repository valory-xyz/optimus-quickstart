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
from pathlib import Path

from aea.helpers.yaml_utils import yaml_dump, yaml_load, yaml_load_all
from aea_cli_ipfs.ipfs_utils import IPFSTool
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
from operate.constants import (
    CONFIG,
    DEPLOYMENT,
    DEPLOYMENT_JSON,
    DOCKER_COMPOSE_YAML,
    KEYS_JSON,
)
from operate.http import Resource
from operate.http.exceptions import NotAllowed, ResourceAlreadyExists
from operate.types import (
    Action,
    ChainData,
    DeploymentConfig,
    KeysType,
    LedgerConfig,
    ServiceType,
    Status,
)
from starlette.types import Receive, Scope, Send
from typing_extensions import TypedDict


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


class DeleteServicePayload(TypedDict):
    """Delete payload."""


class DeleteServiceResponse(TypedDict):
    """Delete response."""


class DeployedNodes(TypedDict):
    """Deployed nodes type."""

    agent: t.List[str]
    tendermint: t.List[str]


class DeploymentType(TypedDict):
    """Deployment type."""

    status: Status
    nodes: DeployedNodes


class GetDeployment(TypedDict):
    """Create deployment payload."""


class StopDeployment(TypedDict):
    """Delete deployment payload."""

    delete: bool


class Deployment(
    Resource[
        DeploymentType,
        t.Dict,
        DeploymentType,
        t.Dict,
        t.Dict,
        StopDeployment,
        DeploymentType,
    ]
):
    """Deployment class."""

    action_to_method = {
        Action.STATUS: "GET",
        Action.BUILD: "POST",
        Action.DEPLOY: "PUT",
        Action.STOP: "DELETE",
    }

    def __init__(self, status: Status, nodes: DeployedNodes, path: Path) -> None:
        """Initialize object."""
        super().__init__()
        self.status = status
        self.nodes = nodes
        self.path = path

    @property
    def json(self) -> DeploymentType:
        """Return deployment status."""
        return {
            "status": self.status,
            "nodes": self.nodes,
        }

    def create(self, data: t.Dict) -> DeploymentType:
        """Create deployment."""
        build = self.path / DEPLOYMENT
        if build.exists():
            raise ResourceAlreadyExists("Deployment already exists.")
        build.mkdir()
        build_dirs(build_dir=build)

        service = Service.load(path=self.path)
        keys_file = self.path / KEYS_JSON
        keys_file.write_text(json.dumps(service.keys, indent=4), encoding="utf-8")

        def _serialize(var: t.Any) -> str:
            """Serialize variable for exporting."""
            if not isinstance(var, str):
                return json.dumps(var, separators=(",", ":"))
            if not (var.startswith("${") and var.endswith("}")):
                return var

            # NOTE: This is a hacky implementation for runtime variable substitution
            obj, attr, key = (
                t.cast(str, var).replace("${", "").replace("}", "").split(".")
            )
            if obj != "service":
                return var
            val = getattr(service, attr).get(key)
            if isinstance(val, str):
                return val
            return json.dumps(val, separators=(",", ":"))

        # Update environment
        _environ = dict(os.environ)
        os.environ.update(
            {
                variable["key"]: _serialize(var=variable["value"])
                for variable in service.deployment_config.get("variables", [])
            }
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
                multisig_address=service.chain_data.get("multisig"),
                agent_instances=service.chain_data.get("instances"),
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

        compose = build / DOCKER_COMPOSE_YAML
        with compose.open("r", encoding="utf-8") as stream:
            deployment = yaml_load(stream=stream)
        self.nodes["agent"] = [
            service for service in deployment["services"] if "_abci_" in service
        ]
        self.nodes["tendermint"] = [
            service for service in deployment["services"] if "_tm_" in service
        ]

        _volumes = []
        for volume, mount in service.deployment_config.get("volumes", {}).items():
            (build / volume).mkdir(exist_ok=True)
            _volumes.append(f"./{volume}:{mount}:Z")
        for service in deployment["services"]:
            if "abci" in service:
                deployment["services"][service]["volumes"].extend(_volumes)
        with compose.open("w", encoding="utf-8") as stream:
            yaml_dump(data=deployment, stream=stream)

        self.status = Status.BUILT
        self.store()
        return self.json

    def update(self, data: t.Dict) -> DeploymentType:
        """Start the service"""
        if self.status != Status.BUILT:
            raise NotAllowed(
                f"The deployment is in {self.status}; It needs to be in {Status.BUILT} status"
            )

        self.status = Status.DEPLOYING
        self.store()

        build = self.path / "deployment"
        run_deployment(build_dir=build, detach=True)

        self.status = Status.DEPLOYED
        self.store()

        return self.json

    def delete(self, data: StopDeployment) -> DeploymentType:
        """Delete deployment."""
        build_dir = self.path / "deployment"
        if self.status == self.status:
            self.status = Status.STOPPING
            self.store()
            stop_deployment(build_dir=build_dir)

        if data.get("delete", False):
            shutil.rmtree(build_dir)
            self.status = Status.CREATED
            self.nodes = {"agent": [], "tendermint": []}
        else:
            self.status = Status.BUILT
        self.store()
        return self.json

    def store(self) -> None:
        """Dump deployment config."""
        (self.path / DEPLOYMENT_JSON).write_text(
            json.dumps(self.json, indent=4),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path: Path) -> "Deployment":
        """Load service from path."""
        file = path / DEPLOYMENT_JSON
        if file.exists():
            config = json.loads(file.read_text(encoding="utf-8"))
            return cls(
                status=Status(config["status"]),
                nodes=config["nodes"],
                path=path,
            )
        return cls(
            status=Status.CREATED,
            nodes={"agent": [], "tendermint": []},
            path=path,
        )


class Service(
    Resource[
        ServiceType,
        t.Dict,
        t.Dict,
        ServiceType,
        ServiceType,
        DeleteServicePayload,
        DeleteServiceResponse,
    ]
):
    """Service class."""

    name: t.Optional[str]
    hash: str
    keys: KeysType
    ledger: t.Optional[LedgerConfig]
    chain_data: t.Optional[ChainData]
    deployment_config: t.Optional[DeploymentConfig]

    service_path: Path
    path: Path

    def __init__(
        self,
        service_path: Path,
        phash: str,
        keys: KeysType,
        ledger: t.Optional[LedgerConfig] = None,
        chain_data: t.Optional[ChainData] = None,
        deployment_config: t.Optional[DeploymentConfig] = None,
        name: t.Optional[str] = None,
    ) -> None:
        """Initialize object."""
        super().__init__()
        self.hash = phash
        self.keys = keys
        self.ledger = ledger
        self.name = name
        self.chain_data = chain_data or {}
        self.deployment_config = deployment_config or {}
        self.service_path = service_path
        self.path = self.service_path.parent

    def deployment(self) -> Deployment:
        """Load deployment object for the service."""
        return Deployment.load(path=self.path)

    async def access(
        self,
        params: t.Dict,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        """Access service resource."""
        scope["method"] = Deployment.action_to_method[
            Action.from_string(params.pop("action"))
        ]
        await Deployment.load(self.path)(scope=scope, receive=receive, send=send)

    @property
    def json(self) -> ServiceType:
        """Return json representation."""
        readme = self.service_path / "README.md"
        return ServiceType(
            {
                "name": self.name,
                "hash": self.hash,
                "keys": self.keys,
                "ledger": self.ledger,
                "chain_data": self.chain_data,
                "deployment_config": self.deployment_config,
                "service_path": str(self.service_path),
                "readme": (
                    readme.read_text(encoding="utf-8") if readme.exists() else None
                ),
            }
        )

    def store(self) -> None:
        """Store current state."""
        (self.path / CONFIG).write_text(
            json.dumps(self.json, indent=4),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path: Path) -> "Service":
        """Load service from path."""
        config = json.loads((path / CONFIG).read_text(encoding="utf-8"))
        return cls(
            phash=config["hash"],
            keys=config["keys"],
            ledger=config["ledger"],
            chain_data=config.get("chain_data"),
            deployment_config=config.get("deployment_config"),
            service_path=Path(config["service_path"]),
            name=config["name"],
        )

    @classmethod
    def new(
        cls,
        path: Path,
        phash: str,
        keys: KeysType,
        ledger: LedgerConfig,
        chain_data: t.Optional[ChainData] = None,
        deployment_config: t.Optional[DeploymentConfig] = None,
        name: t.Optional[str] = None,
    ) -> "Service":
        """Create a new service."""
        service_path = path / phash
        service_path.mkdir()
        downloaded = IPFSTool().download(
            hash_id=phash,
            target_dir=service_path,
        )
        if name is None:
            with Path(downloaded, "service.yaml").open("r", encoding="utf-8") as fp:
                config, *_ = yaml_load_all(fp)
            name = config["author"] + "/" + config["name"]
        service = cls(
            phash=phash,
            keys=keys,
            chain_data=chain_data,
            deployment_config=deployment_config,
            ledger=ledger,
            service_path=Path(downloaded),
            name=name,
        )
        service.store()
        return service

    def update(self, data: ServiceType) -> ServiceType:
        """Update service."""
        self.hash = data["hash"]
        self.keys = data["keys"]
        self.variables = data.get("variables", self.variables)
        self.ledger = data.get("ledger", self.ledger)
        self.name = data.get("name", self.name)
        self.chain_data = data.get("chain_data", self.chain_data)
        self.store()
        return self.json

    def delete(self, data: DeleteServicePayload) -> DeleteServiceResponse:
        """Delete service."""
        shutil.rmtree(self.path)
        return DeleteServiceResponse({})
