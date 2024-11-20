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
import subprocess  # nosec
import typing as t
from copy import copy, deepcopy
from dataclasses import dataclass
from pathlib import Path

from aea.configurations.constants import (
    DEFAULT_LEDGER,
    LEDGER,
    PRIVATE_KEY,
    PRIVATE_KEY_PATH_SCHEMA,
    SKILL,
)
from aea.configurations.data_types import PackageType
from aea.helpers.env_vars import apply_env_variables
from aea.helpers.yaml_utils import yaml_dump, yaml_load, yaml_load_all
from aea_cli_ipfs.ipfs_utils import IPFSTool
from autonomy.cli.helpers.deployment import run_deployment, stop_deployment
from autonomy.configurations.loader import load_service_config
from autonomy.deploy.base import BaseDeploymentGenerator
from autonomy.deploy.base import ServiceBuilder as BaseServiceBuilder
from autonomy.deploy.constants import (
    AGENT_KEYS_DIR,
    BENCHMARKS_DIR,
    DEFAULT_ENCODING,
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
from operate.services.deployment_runner import run_host_deployment, stop_host_deployment
from operate.services.utils import tendermint

# pylint: disable=unused-import
from operate.types import (
    ChainConfig,
    ChainConfigs,
    ChainType,
    DeployedNodes,
    DeploymentConfig,
    DeploymentStatus,
    LedgerConfig,
    LedgerConfigs,
    LedgerType,
    OnChainData,
    OnChainState,
    OnChainUserParams,
    ServiceTemplate,
)


SAFE_CONTRACT_ADDRESS = "safe_contract_address"
ALL_PARTICIPANTS = "all_participants"
CONSENSUS_THRESHOLD = "consensus_threshold"
DELETE_PREFIX = "delete_"

# pylint: disable=no-member,redefined-builtin,too-many-instance-attributes

DUMMY_MULTISIG = "0xm"
NON_EXISTENT_TOKEN = -1


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

    def try_update_runtime_params(
        self,
        multisig_address: t.Optional[str] = None,
        agent_instances: t.Optional[t.List[str]] = None,
        consensus_threshold: t.Optional[int] = None,
        service_id: t.Optional[int] = None,
    ) -> None:
        """Try and update setup parameters."""

        param_overrides: t.List[t.Tuple[str, t.Any]] = []
        if multisig_address is not None:
            param_overrides.append(
                (SAFE_CONTRACT_ADDRESS, multisig_address),
            )

        if agent_instances is not None:
            param_overrides.append(
                (ALL_PARTICIPANTS, agent_instances),
            )

        if consensus_threshold is not None:
            param_overrides.append(
                (CONSENSUS_THRESHOLD, consensus_threshold),
            )

        overrides = copy(self.service.overrides)
        for override in overrides:
            (
                override,
                component_id,
                has_multiple_overrides,
            ) = self.service.process_metadata(
                configuration=override,
            )

            if component_id.component_type.value == SKILL:
                self._try_update_setup_data(
                    data=param_overrides,
                    override=override,
                    skill_id=component_id.public_id,
                    has_multiple_overrides=has_multiple_overrides,
                )
                self._try_update_tendermint_params(
                    override=override,
                    skill_id=component_id.public_id,
                    has_multiple_overrides=has_multiple_overrides,
                )
                if service_id is not None:
                    override["models"]["params"]["args"][
                        "on_chain_service_id"
                    ] = service_id

            override["type"] = component_id.package_type.value
            override["public_id"] = str(component_id.public_id)

        self.service.overrides = overrides


class ServiceHelper:
    """Service config helper."""

    def __init__(self, path: Path) -> None:
        """Initialize object."""
        self.path = path
        self.config = load_service_config(service_path=path)

    def ledger_configs(self) -> "LedgerConfigs":
        """Get ledger configs."""
        ledger_configs = {}
        for override in self.config.overrides:
            override = apply_env_variables(override, env_variables=os.environ.copy())
            if (
                override["type"] == "connection"
                and "valory/ledger" in override["public_id"]
            ):
                for _chain_id, config in override["config"]["ledger_apis"].items():
                    chain = ChainType.from_id(cid=config["chain_id"])
                    ledger_configs[str(config["chain_id"])] = LedgerConfig(
                        rpc=config["address"],
                        chain=chain,
                        type=LedgerType.ETHEREUM,
                    )
        return ledger_configs

    def deployment_config(self) -> DeploymentConfig:
        """Returns deployment config."""
        return DeploymentConfig(self.config.json.get("deployment", {}))  # type: ignore


# TODO: Port back to open-autonomy
class HostDeploymentGenerator(BaseDeploymentGenerator):
    """Host deployment."""

    output_name: str = "runtime.json"
    deployment_type: str = "host"

    def generate_config_tendermint(self) -> "HostDeploymentGenerator":
        """Generate tendermint configuration."""
        tmhome = str(self.build_dir / "node")
        subprocess.run(  # pylint: disable=subprocess-run-check # nosec
            args=[
                str(
                    shutil.which("tendermint"),
                ),
                "--home",
                tmhome,
                "init",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # TODO: Dynamic port allocation
        params = {
            "TMHOME": tmhome,
            "TMSTATE": str(self.build_dir / "tm_state"),
            "P2P_LADDR": "tcp://localhost:26656",
            "RPC_LADDR": "tcp://localhost:26657",
            "PROXY_APP": "tcp://localhost:26658",
            "CREATE_EMPTY_BLOCKS": "true",
            "USE_GRPC": "false",
            "FLASK_APP": "tendermint:create_server",
        }
        (self.build_dir / "tendermint.json").write_text(
            json.dumps(params, indent=2),
            encoding="utf-8",
        )
        shutil.copy(
            tendermint.__file__.replace(".pyc", ".py"),
            self.build_dir / "tendermint.py",
        )
        return self

    def generate(
        self,
        image_version: t.Optional[str] = None,
        use_hardhat: bool = False,
        use_acn: bool = False,
    ) -> "HostDeploymentGenerator":
        """Generate agent and tendermint configurations"""
        agent = self.service_builder.generate_agent(agent_n=0)
        agent = {key: f"{value}" for key, value in agent.items()}
        (self.build_dir / "agent.json").write_text(
            json.dumps(agent, indent=2),
            encoding="utf-8",
        )
        return self

    def _populate_keys(self) -> None:
        """Populate the keys directory"""
        # TODO: Add multiagent support
        kp, *_ = t.cast(t.List[t.Dict[str, str]], self.service_builder.keys)
        key = kp[PRIVATE_KEY]
        ledger = kp.get(LEDGER, DEFAULT_LEDGER)
        keys_file = self.build_dir / PRIVATE_KEY_PATH_SCHEMA.format(ledger)
        keys_file.write_text(key, encoding=DEFAULT_ENCODING)

    def _populate_keys_multiledger(self) -> None:
        """Populate the keys directory with multiple set of keys"""

    def populate_private_keys(self) -> "DockerComposeGenerator":
        """Populate the private keys to the build directory for host mapping."""
        if self.service_builder.multiledger:
            self._populate_keys_multiledger()
        else:
            self._populate_keys()
        return self


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
        :return: Deployment object
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

    # pylint: disable=too-many-locals
    def _build_docker(
        self,
        force: bool = True,
        _chain_id: str = "100",
    ) -> None:
        """Build docker deployment."""
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

            home_chain_data = service.chain_configs[service.home_chain_id]
            builder.try_update_runtime_params(
                multisig_address=home_chain_data.chain_data.multisig,
                agent_instances=home_chain_data.chain_data.instances,
                service_id=home_chain_data.chain_data.token,
                consensus_threshold=None,
            )
            for _chain, config in service.chain_configs.items():
                builder.try_update_ledger_params(
                    chain=config.ledger_config.chain.name.lower(),
                    address=config.ledger_config.rpc,
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

        # TO-DO: this is no longer valid because of the breaking change in v0.18.0, this is not required in optimus # noqa
        # for node in deployment["services"]: # noqa
        #     if "abci" in node: # noqa
        #         deployment["services"][node]["volumes"].extend(_volumes) # noqa
        #         if ( # noqa
        #             "SKILL_TRADER_ABCI_MODELS_PARAMS_ARGS_MECH_REQUEST_PRICE=0" # noqa
        #             in deployment["services"][node]["environment"] # noqa
        #         ): # noqa
        #             deployment["services"][node]["environment"].remove( # noqa
        #                 "SKILL_TRADER_ABCI_MODELS_PARAMS_ARGS_MECH_REQUEST_PRICE=0" # noqa
        #             ) # noqa
        #             deployment["services"][node]["environment"].append( # noqa
        #                 "SKILL_TRADER_ABCI_MODELS_PARAMS_ARGS_MECH_REQUEST_PRICE=10000000000000000" # noqa
        #             ) # noqa

        with (build / DOCKER_COMPOSE_YAML).open("w", encoding="utf-8") as stream:
            yaml_dump(data=deployment, stream=stream)

        self.status = DeploymentStatus.BUILT
        self.store()

    def _build_host(self, force: bool = True, chain_id: str = "100") -> None:
        """Build host depployment."""
        build = self.path / DEPLOYMENT
        if build.exists() and not force:
            return

        if build.exists() and force:
            stop_host_deployment(build_dir=build)
            shutil.rmtree(build)

        service = Service.load(path=self.path)
        if service.helper.config.number_of_agents > 1:
            raise RuntimeError(
                "Host deployment currently only supports single agent deployments"
            )

        chain_config = service.chain_configs[chain_id]
        ledger_config = chain_config.ledger_config
        chain_data = chain_config.chain_data

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
            builder.deplopyment_type = HostDeploymentGenerator.deployment_type
            builder.try_update_abci_connection_params()
            builder.try_update_runtime_params(
                multisig_address=chain_data.multisig,
                agent_instances=chain_data.instances,
                service_id=chain_data.token,
                consensus_threshold=None,
            )
            # TODO: Support for multiledger
            builder.try_update_ledger_params(
                chain=LedgerType(ledger_config.type).name.lower(),
                address=ledger_config.rpc,
            )

            (
                HostDeploymentGenerator(
                    service_builder=builder,
                    build_dir=build.resolve(),
                    use_tm_testnet_setup=True,
                )
                .generate_config_tendermint()
                .generate()
                .populate_private_keys()
            )

        except Exception as e:
            if build.exists():
                shutil.rmtree(build)
            raise e

        # Mech price patch.
        agent_vars = json.loads(Path(build, "agent.json").read_text(encoding="utf-8"))
        if "SKILL_TRADER_ABCI_MODELS_PARAMS_ARGS_MECH_REQUEST_PRICE" in agent_vars:
            agent_vars[
                "SKILL_TRADER_ABCI_MODELS_PARAMS_ARGS_MECH_REQUEST_PRICE"
            ] = "10000000000000000"
            Path(build, "agent.json").write_text(
                json.dumps(agent_vars, indent=4),
                encoding="utf-8",
            )

        self.status = DeploymentStatus.BUILT
        self.store()

    def build(
        self,
        use_docker: bool = False,
        force: bool = True,
        chain_id: str = "100",
    ) -> None:
        """
        Build a deployment

        :param use_docker: Use docker deployment
        :param force: Remove existing deployment and build a new one
        :return: Deployment object
        """
        if use_docker:
            return self._build_docker(force=force, _chain_id=chain_id)
        return self._build_host(force=force, chain_id=chain_id)

    def start(self, use_docker: bool = False) -> None:
        """Start the service"""
        if self.status != DeploymentStatus.BUILT:
            raise NotAllowed(
                f"The deployment is in {self.status}; It needs to be in {DeploymentStatus.BUILT} status"
            )

        self.status = DeploymentStatus.DEPLOYING
        self.store()

        try:
            if use_docker:
                run_deployment(build_dir=self.path / "deployment", detach=True)
            else:
                run_host_deployment(build_dir=self.path / "deployment")
        except Exception:
            self.status = DeploymentStatus.BUILT
            self.store()
            raise

        self.status = DeploymentStatus.DEPLOYED
        self.store()

    def stop(self, use_docker: bool = False, force: bool = False) -> None:
        """Stop the deployment."""
        if self.status != DeploymentStatus.DEPLOYED and not force:
            return

        self.status = DeploymentStatus.STOPPING
        self.store()

        if use_docker:
            stop_deployment(build_dir=self.path / "deployment")
        else:
            stop_host_deployment(build_dir=self.path / "deployment")

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

    version: int
    hash: str
    keys: Keys
    home_chain_id: str
    chain_configs: ChainConfigs

    path: Path
    service_path: Path

    name: t.Optional[str] = None

    _helper: t.Optional[ServiceHelper] = None
    _deployment: t.Optional[Deployment] = None

    _file = "config.json"

    @classmethod
    def migrate_format(cls, path: Path) -> None:
        """Migrate the JSON file format if needed."""
        file_path = (
            path / Service._file
            if Service._file is not None and path.name != Service._file
            else path
        )

        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        if "version" in data:
            # Data is already in the new format
            return

        # Migrate from old format to new format
        new_data = {
            "version": 2,
            "hash": data.get("hash"),
            "keys": data.get("keys"),
            "home_chain_id": "100",  # Assuming a default value for home_chain_id
            "chain_configs": {
                "10": {
                    "ledger_config": {
                        "rpc": data.get("ledger_config", {}).get("rpc"),
                        "type": data.get("ledger_config", {}).get("type"),
                        "chain": data.get("ledger_config", {}).get("chain"),
                    },
                    "chain_data": {
                        "instances": data.get("chain_data", {}).get("instances", []),
                        "token": data.get("chain_data", {}).get("token"),
                        "multisig": data.get("chain_data", {}).get("multisig"),
                        "staked": data.get("chain_data", {}).get("staked", False),
                        "on_chain_state": data.get("chain_data", {}).get(
                            "on_chain_state", 3
                        ),
                        "user_params": {
                            "staking_program_id": "pearl_alpha",
                            "nft": data.get("chain_data", {})
                            .get("user_params", {})
                            .get("nft"),
                            "threshold": data.get("chain_data", {})
                            .get("user_params", {})
                            .get("threshold"),
                            "use_staking": data.get("chain_data", {})
                            .get("user_params", {})
                            .get("use_staking"),
                            "cost_of_bond": data.get("chain_data", {})
                            .get("user_params", {})
                            .get("cost_of_bond"),
                            "fund_requirements": data.get("chain_data", {})
                            .get("user_params", {})
                            .get("fund_requirements", {}),
                        },
                    },
                }
            },
            "service_path": data.get("service_path", ""),
            "name": data.get("name", ""),
        }

        with open(file_path, "w", encoding="utf-8") as file:
            json.dump(new_data, file, indent=2)

    @classmethod
    def load(cls, path: Path) -> "Service":
        """Load a service"""
        cls.migrate_format(path)
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

    # pylint: disable=too-many-locals
    @staticmethod
    def new(
        hash: str,
        keys: Keys,
        service_template: ServiceTemplate,
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
            service_yaml, *_ = yaml_load_all(fp)

        ledger_configs = ServiceHelper(path=service_path).ledger_configs()

        chain_configs = {}
        for chain, config in service_template["configurations"].items():
            ledger_config = ledger_configs[chain]
            ledger_config.rpc = config["rpc"]

            chain_data = OnChainData(
                instances=[],
                token=NON_EXISTENT_TOKEN,
                multisig=DUMMY_MULTISIG,
                staked=False,
                on_chain_state=OnChainState.NON_EXISTENT,
                user_params=OnChainUserParams.from_json(dict(config)),
            )

            chain_configs[chain] = ChainConfig(
                ledger_config=ledger_config,
                chain_data=chain_data,
            )

        service = Service(
            version=2,  # TODO implement in appropriate place
            name=service_yaml["author"] + "/" + service_yaml["name"],
            hash=service_template["hash"],
            keys=keys,
            home_chain_id=service_template["home_chain_id"],
            chain_configs=chain_configs,
            path=service_path.parent,
            service_path=service_path,
        )
        service.store()
        return service

    def update_user_params_from_template(
        self, service_template: ServiceTemplate
    ) -> None:
        """Update user params from template."""
        for chain, config in service_template["configurations"].items():
            self.chain_configs[
                chain
            ].chain_data.user_params = OnChainUserParams.from_json(dict(config))
            self.chain_configs[chain].ledger_config.rpc = config.get("rpc", "")

        self.store()

    def delete(self) -> None:
        """Delete a service."""
        parent_directory = self.path.parent
        new_path = parent_directory / f"{DELETE_PREFIX}{self.path.name}"
        shutil.move(self.path, new_path)
        shutil.rmtree(new_path)
