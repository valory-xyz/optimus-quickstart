import logging
from pathlib import Path
import docker
import yaml
from aea.helpers.base import IPFSHash
from service import ServiceManager
import itertools

logging.basicConfig(level=logging.DEBUG)

HTTP_OK = 200
HTTP_BAD_REQUEST = 400
HTTP_SERVER_ERROR = 500

MASTER_KEY = "master-key"


class Controller:
    def __init__(self) -> None:
        self.manager = ServiceManager()
        self.docker_client = docker.from_env()

        # Load configuration
        with open(Path("operate.yaml"), "r") as config_file:
            self.config = [doc for doc in yaml.safe_load_all(config_file)][0]

        # Download all supported services
        self.fetch_services()

    def fetch_services(self):
        for service_hash, service_config in self.config["services"].items():
            logging.debug(f"Fetching {service_config['name']}")
            self.manager.fetch(phash=service_hash)

    def get_services(self):

        services = self.config["services"]

        running_tags = list(set(itertools.chain.from_iterable([
            container.image.tags for container in self.docker_client.containers.list()
        ])))

        for service_hash in services.keys():
            service_author, service_name = self.manager.get(service_hash)["name"].split("/")
            config = self.manager.get_config(service_hash, service_name)
            agent_hash = config[0]["agent"].split(":")[-1]
            service_tag = f"{service_author}/oar-{service_name}:{agent_hash}"
            services[service_hash]["running"] = service_tag in running_tags

        return services, HTTP_OK

    def get_vars(self, service_hash):
        return {}, HTTP_OK

    def get_service_keys(self, service_hash):
        return {}, HTTP_OK

    def build_deployment(self, service_hash, args):
        service_config = self.config["services"][service_hash]
        custom_addresses = self.config["chains"][service_config["chain"]]
        rpc = args.get("rpc")
        agent_addresses = [
            self.manager.keys.create() for _ in range(service_config["number_of_keys"])
        ]

        code = HTTP_OK
        response_json = {
            "fund_requirements": {
                address: service_config["required_funds"] for address in agent_addresses
            }
        }

        try:
            published = self.manager.mint(
                phash=service_hash,
                rpc=rpc,
                agent_id=service_config["agent_id"],
                number_of_slots=service_config["number_of_slots"],
                cost_of_bond=service_config["cost_of_bond"],
                threshold=service_config["threshold"],
                nft=IPFSHash(self.config["services"][service_hash]["nft"]),
                custom_addresses=custom_addresses,
            )

            self.manager.activate(
                phash=service_hash,
                rpc=rpc,
                custom_addresses=custom_addresses,
            )

            self.manager.register(
                phash=service_hash,
                instances=agent_addresses,
                agents=[14],
                rpc=rpc,
                custom_addresses=custom_addresses,
            )

            self.manager.deploy(
                phash=service_hash,
                reuse_multisig=False,
                rpc=rpc,
                custom_addresses=custom_addresses,
            )

            self.manager.build(
                phash=service_hash,
                environment={},
                volumes={"data": "/data"},
            )

        except Exception as e:
            logging.error(str(e))
            code = HTTP_SERVER_ERROR
            response_json = {"error": str(e)}

        return response_json, code

    def delete_deployment(self, service_hash):
        return {}, HTTP_OK

    def start_service(self, service_hash):
        self.manager.start(phash=service_hash)
        return {}, HTTP_OK

    def stop_service(self, service_hash):
        self.manager.stop(phash=service_hash)
        return {}, HTTP_OK

