from pathlib import Path
import yaml


def add_volume_to_service(compose_file, service_name, volume_name, volume_path):

    if not Path.exists(compose_file):
        return

    with open(compose_file, "r") as compose:
        compose_data = yaml.safe_load(compose)

    # Check if the service exists in the Docker Compose file
    if service_name not in compose_data["services"].keys():
        return

    compose_data["services"][service_name]["volumes"].append(
        f"./{str(volume_path)}:/{volume_name}:Z"
    )

    with open(compose_file, "w") as compose:
        yaml.dump(compose_data, compose, sort_keys=False)
