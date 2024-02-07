from pathlib import Path
import yaml
import logging
from service import ServiceManager
from aea.helpers.base import IPFSHash

logging.basicConfig(level=logging.DEBUG)

HTTP_OK = 200
HTTP_BAD_REQUEST = 400
HTTP_SERVER_ERROR = 500

class Controller:

    def __init__(self) -> None:

        # Load configuration
        with open(Path("operate.yaml"), "r") as config_file:
            self.config = [doc for doc in yaml.safe_load_all(config_file)][0]

        # Download all supported services
        self.fetch_services()


    def fetch_services(self):
        service_manager = ServiceManager()
        for service_hash, service_config in self.config["services"].items():
            logging.debug(f"Fetching {service_config['name']}")
            service_manager.fetch(phash=service_hash)


    def get_services(self):
        return self.config["services"], HTTP_OK


    def get_vars(self, service_hash):
        return {}, HTTP_OK


    def get_service_keys(self, service_hash):
        return {}, HTTP_OK


    def build_deployment(self, service_hash, args):
        manager = ServiceManager()
        service_config = self.config["services"][service_hash]
        custom_addresses = self.config["chains"][service_config["chain"]]
        rpc = args.get("rpc")
        agent_addresses = [manager.keys.create() for _ in range(service_config["number_of_keys"])]

        code = HTTP_OK
        response_json = {"addresses": agent_addresses}

        # try:

        published = manager.mint(
            phash=service_hash,
            rpc=rpc,
            agent_id=service_config["agent_id"],
            number_of_slots=service_config["number_of_slots"],
            cost_of_bond=service_config["cost_of_bond"],
            threshold=service_config["threshold"],
            nft=IPFSHash(
                self.config["services"][service_hash]["nft"]
            ),
            custom_addresses=custom_addresses,
        )

        manager.activate(
            phash=service_hash,
            rpc=rpc,
            custom_addresses=custom_addresses,
        )

        manager.register(
            phash=service_hash,
            instances=agent_addresses,
            agents=[14],
            rpc=rpc,
            custom_addresses=custom_addresses,
        )

        manager.deploy(
            phash=service_hash,
            reuse_multisig=False,
            rpc=rpc,
            custom_addresses=custom_addresses,
        )

        manager.build(
            phash=service_hash,
            environment={},
            volumes={"data": "/data"},
        )

        # except Exception as e:
        #     logging.error(str(e))
        #     code = HTTP_SERVER_ERROR
        #     response_json = {"error": str(e)}

        return response_json, code


    def delete_deployment(self, service_hash):
        return {}, HTTP_OK


    def start_service(self, service_hash):
        manager = ServiceManager()
        manager.start(phash=service_hash)
        return {}, HTTP_OK


    def stop_service(self, service_hash):
        manager = ServiceManager()
        manager.stop(phash=service_hash)
        return {}, HTTP_OK


# controller = Controller()
# controller.build_deployment(
#     "bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe",
#     {"rpc": "http://localhost:8545"}
# )
# controller.start_service("bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe")
# controller.stop_service("bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe")