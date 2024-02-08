import logging
from pathlib import Path

import yaml
from aea.helpers.base import IPFSHash
from service import KEYS, OPERATE, KeysManager, ServiceManager

logging.basicConfig(level=logging.DEBUG)

HTTP_OK = 200
HTTP_BAD_REQUEST = 400
HTTP_SERVER_ERROR = 500

MASTER_KEY = "master-key"


class Controller:
    def __init__(self) -> None:
        self.manager = ServiceManager()
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
        return self.config["services"], HTTP_OK

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


# controller = Controller()
# controller.build_deployment(
#     "bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe",
#     {"rpc": "http://localhost:8545"}
# )
# controller.start_service("bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe")
# controller.stop_service("bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe")
