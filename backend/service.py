import json
import logging
import os
import shutil
import typing as t
from pathlib import Path


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
from protocol import OnChainManager

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
        key_path = (self._path / f"{name}.json")

        if key_path.is_file():
            return crypto.address

        key_path.write_text(
            json.dumps(
                {
                    "address": crypto.address,
                    "private_key": crypto.private_key,
                    "ledger": "ethereum",
                },
                indent=4
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

    def store(self, service: t.Dict) -> None:
        """Store service."""
        (self._services / str(service["hash"]) / CONFIG).write_text(
            json.dumps(
                service,
                indent=4,
            )
        )

    def fetch(self, phash: str) -> t.Dict:
        """Fetch service to local storage."""
        spath = self._services / phash

        # TODO: Remove later
        if spath.exists():
            return None

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
            agent_id=agent_id,  # trader agent
            number_of_slots=number_of_slots,
            cost_of_bond=cost_of_bond,  # Taken from the script
            threshold=threshold,
            nft=nft,  # from script
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

        info = manager.info(service_id=service["token"])
        service["multisig"] = info["multisig_address"]
        service["instances"] = info["instances"]
        self.store(service=service)
        return info

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