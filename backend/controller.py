from typing import KeysView
from autonomy.cli.helpers.registry import fetch_service_remote
from autonomy.cli.helpers.image import build_image
from aea.configurations.data_types import PublicId
from aea.cli.generate_key import _generate_multiple_keys
from autonomy.deploy.build import generate_deployment
from pathlib import Path
from autonomy.deploy.generators.docker_compose.base import DockerComposeGenerator
from autonomy.cli.helpers.deployment import stop_deployment, run_deployment, _build_dirs
import os
import yaml
import petname
import json
import logging
from scripts.utils import add_volume_to_service
from service import ServiceManager
from aea.helpers.base import IPFSHash

logging.basicConfig(level=logging.DEBUG)

# install docker compose, tendermint

class Controller:

    def __init__(self) -> None:

        # Load config
        with open(Path("operate.yaml"), "r") as config_file:
            self.config = [doc for doc in yaml.safe_load_all(config_file)][0]

        # Set dirs
        self.app_dir = Path().absolute()  # TODO: Viraj: might be better to use relative paths for docker volumes
        self.data_dir = Path(self.app_dir, "data")
        self.services_dir = Path(self.data_dir, "services")
        self.keys_dir = Path(self.data_dir, "keys")
        self.builds_dir = Path(self.data_dir, "builds")
        self.volumes_dir = Path(self.data_dir, "volumes")

        # Create dirs
        for d in [self.data_dir, self.services_dir, self.keys_dir, self.builds_dir, self.volumes_dir]:
            Path(d).mkdir(parents=True, exist_ok=True)

        # Load keys
        self.key_names = [k.stem for k in self.keys_dir.iterdir()]

        # Create master key
        self.create_keys("master-key")

        # Download services
        self.fetch_services()


    def get_services(self):
        return self.config["services"]

    def get_service_dir(self, service_id):
        service_id = PublicId.from_str(service_id)
        return Path(self.services_dir, str(service_id).replace("/", ":").replace(":", "__"))

    def get_build_dir(self, service_id):
        service_id = PublicId.from_str(service_id)
        return Path(self.builds_dir, str(service_id).replace("/", ":").replace(":", "__"))

    def get_volume_dir(self, service_id):
        service_id = PublicId.from_str(service_id)
        return Path(self.volumes_dir, str(service_id).replace("/", ":").replace(":", "__"))

    def get_keys(self):
        return self.key_names

    def create_keys_file(self, key_names, target_dir):
        keys = []
        for key_name in key_names:
            with open(Path(self.keys_dir, f"{key_name}.json"), "r") as key_file:
                keys.append(json.load(key_file)[0])

        keys_path = Path(target_dir, "keys.json")
        with open(keys_path, "w") as keys_file:
            json.dump(keys, keys_file, indent=4)

        return keys_path

    def create_keys(self, name=None, type_="ethereum"):
        name = name or petname.Generate(2)
        name += ".json"
        keys_path = Path(self.keys_dir, name)
        if not Path(keys_path).is_file():
            _generate_multiple_keys(n=1, type_=type_, password=None, file=keys_path)
        return name

    def fetch_services(self):
        for service_id in self.config["services"].keys():
            service_dir = self.get_service_dir(service_id)
            if not os.path.isdir(service_dir):
                logging.debug(f"Fetching {service_id} into {service_dir}")
                fetch_service_remote(PublicId.from_str(service_id), service_dir)


    def get_service_config(self, service_id):
        service_dir = self.get_service_dir(service_id)
        with open(Path(service_dir, "service.yaml"), "r") as service_config_file:
            service_config = [doc for doc in yaml.safe_load_all(service_config_file)]
            return service_config

    def get_vars(self, service_id):
        service_config = self.get_service_config(service_id)
        return service_config[1][0]["models"]["params"]["args"]


    def build_deployment(self, service_id, key_names, env_vars=None):

        service_dir = self.get_service_dir(service_id)
        build_dir = self.get_build_dir(service_id)

        # Remove build if it exists
        if Path.exists(build_dir):
            pass


        # Load the service config
        service_config = self.get_service_config(service_id)

        # Build docker image
        build_image(
            agent=PublicId.from_str(service_config[0]["agent"]),
            service_dir=service_dir
        )

        # Build deployment. TODO: remove folder if exists
        Path(build_dir).mkdir(parents=True, exist_ok=True)
        _build_dirs(build_dir)

        # Create keys file
        keys_file = self.create_keys_file(key_names, build_dir)

        # Write env file
        self.write_env_file(service_id, key_names, env_vars)

        # Generate deployment
        generate_deployment(
            type_of_deployment=DockerComposeGenerator.deployment_type,
            keys_file=keys_file,
            service_path=service_dir,
            build_dir=build_dir,
            number_of_agents=1,
            use_tm_testnet_setup=True,
        )

        # Add data volume to docker-compose.yaml
        add_volume_to_service(
            Path(build_dir, "docker-compose.yaml"),
            f"{PublicId.from_str(service_id).name}_abci_0",
            "data",
            self.get_volume_dir(service_id)
        )

    def write_env_file(self, service_id, key_names, env_vars):
        build_dir = self.get_build_dir(service_id)

        all_participants = []
        for key_name in key_names:
            with open(Path(self.keys_dir, f"{key_name}.json"), "r") as key_file:
                all_participants.extend([key["address"] for key in json.load(key_file)])

        env_vars = {
            "ALL_PARTICIPANTS": all_participants
        }

        env_file = Path(build_dir, ".env")
        with open(env_file, "w") as env_file:
            env_file.writelines([f"{k}={v}" for k, v in env_vars.items()])

    def start_service(self, service_id):
        build_dir = self.get_build_dir(service_id)
        run_deployment(
            build_dir=build_dir,
            no_recreate=False,
            remove_orphans=False,
            detach=True
        )

    def stop_service(self, service_id):
        build_dir = self.get_build_dir(service_id)
        stop_deployment(build_dir)

    def get_service(self, service_id):
        return Service(
            service_id=service_id,
            service_path=self.get_service_dir(service_id),
            chain_type=self.config["services"][str(service_id)]["chain_type"],
            key=Path(self.get_build_dir(service_id), "keys.json")
        )

    def test(self):
        pass

phash = "bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe"
gnosis = {
    "service_manager": "0x04b0007b2aFb398015B76e5f22993a1fddF83644",
    "service_registry": "0x9338b5153AE39BB89f50468E608eD9d764B755fD",
    "service_registry_token_utility": "0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8",
    "gnosis_safe_proxy_factory": "0x3C1fF68f5aa342D296d4DEe4Bb1cACCA912D95fE",
    "gnosis_safe_same_address_multisig": "0x6e7f594f680f7aBad18b7a63de50F0FeE47dfD06",
    "multisend": "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
}

manager = ServiceManager()

print("Fetching...")
manager.fetch(phash=phash)

print("Minting...")
published = manager.mint(
    phash=phash,
    rpc="http://localhost:8545",
    agent_id=14,  # trader agent
    number_of_slots=1,
    cost_of_bond=10000000000000000,  # from script
    threshold=1,
    nft=IPFSHash(
        "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq"
    ),  # from script
    custom_addresses=gnosis,
)
print("Activating...")
manager.activate(
    phash=phash,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Registering...")
manager.register(
    phash=phash,
    instances=[manager.keys.create()],
    agents=[14],
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Deploying...")
manager.deploy(
    phash=phash,
    reuse_multisig=False,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Building...")
manager.build(
    phash=phash,
    environment={},
    volumes={"data": "/data"},
)

print("Starting...")
manager.start(phash=phash)

input("> Press enter to stop")
print("Stopping...")
manager.stop(phash=phash)