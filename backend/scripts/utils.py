from autonomy.cli.helpers.chain import MintHelper
from autonomy.chain.config import ChainType
from typing import cast
from pathlib import Path
import yaml

# def mint_service():

#     mint_helper = (
#         MintHelper(
#             chain_type=ChainType.CUSTOM,
#             key=key,
#             update_token=update,
#             dry_run=ctx.config.get("dry_run"),
#             timeout=ctx.config.get("timeout"),
#             retries=ctx.config.get("retries"),
#             sleep=ctx.config.get("sleep"),
#         )
#         .load_package_configuration(
#             package_path=package_path, package_type=PackageType.SERVICE
#         )
#         .load_metadata()
#         .verify_nft(nft=nft)
#         .verify_service_dependencies(agent_id=agent_id)
#         .publish_metadata()
#     )

#     mint_helper.mint_service(
#         number_of_slots=number_of_slots,
#         cost_of_bond=cost_of_bond,
#         threshold=threshold,
#         token=token,
#         owner=owner,
#     )

def add_volume_to_service(compose_file, service_name, volume_name, volume_path):

    if not Path.exists(compose_file):
        return

    with open(compose_file, "r") as compose:
        compose_data = yaml.safe_load(compose)

    # Check if the service exists in the Docker Compose file
    if service_name not in compose_data["services"].keys():
        return

    relative_volume_path = volume_path.relative_to(compose_file.parent)

    compose_data["services"][service_name]["volumes"].append(
        f"./{str(relative_volume_path)}:/{volume_name}:Z"
    )

    with open(compose_file, "w") as compose:
        yaml.dump(compose_data, compose, sort_keys=False)
