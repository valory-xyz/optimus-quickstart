# utils.py
import json
from pathlib import Path
from datetime import datetime
from decimal import Decimal, getcontext
import logging
import docker
from web3 import Web3
from web3.middleware import geth_poa_middleware
from enum import Enum

# Set decimal precision
getcontext().prec = 18

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

# Terminal color codes
class ColorCode:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"

class StakingState(Enum):
    """Staking state enumeration for the staking."""
    UNSTAKED = 0
    STAKED = 1
    EVICTED = 2

def _color_string(text: str, color_code: str) -> str:
    return f"{color_code}{text}{ColorCode.RESET}"

def _color_bool(is_true: bool, true_string: str = "True", false_string: str = "False") -> str:
    if is_true:
        return _color_string(true_string, ColorCode.GREEN)
    return _color_string(false_string, ColorCode.RED)

def _warning_message(current_value: Decimal, threshold: Decimal, message: str = "") -> str:
    default_message = _color_string(
        f"- Value too low. Threshold is {threshold:.2f}.",
        ColorCode.YELLOW,
    )
    if current_value < threshold:
        return _color_string(message or default_message, ColorCode.YELLOW)
    return ""

def _print_section_header(header: str, output_width: int = 80) -> None:
    print("\n\n" + header)
    print("=" * output_width)

def _print_subsection_header(header: str, output_width: int = 80) -> None:
    print("\n" + header)
    print("-" * output_width)

def _print_status(key: str, value: str, message: str = "") -> None:
    line = f"{key:<30}{value:<20}"
    if message:
        line += f"{message}"
    print(line)

def wei_to_unit(wei: int) -> Decimal:
    """Convert Wei to unit."""
    return Decimal(wei) / Decimal(1e18)

def wei_to_token(wei: int, token: str = "xDAI") -> str:
    """Convert Wei to token."""
    return f"{wei_to_unit(wei):.2f} {token}"

def wei_to_olas(wei: int) -> str:
    """Converts and formats wei to OLAS."""
    return "{:.2f} OLAS".format(wei_to_unit(wei))

def wei_to_eth(wei_value):
    return Decimal(wei_value) / Decimal(1e18)

def get_chain_name(chain_id, chain_id_to_metadata):
    return chain_id_to_metadata.get(int(chain_id), {}).get("name", f"Chain {chain_id}")

def load_operator_address(operate_home):
    ethereum_json_path = operate_home / "wallets" / "ethereum.json"
    try:
        with open(ethereum_json_path, "r") as f:
            ethereum_data = json.load(f)
        operator_address = ethereum_data.get("safes", {}).get("4")
        if not operator_address:
            print("Error: Operator address not found for chain ID 4 in the wallet file.")
            return None
        return operator_address
    except FileNotFoundError:
        print(f"Error: Ethereum wallet file not found at {ethereum_json_path}")
        return None
    except json.JSONDecodeError:
        print("Error: Ethereum wallet file contains invalid JSON.")
        return None

def validate_config(config):
    required_keys = ['home_chain_id', 'chain_configs']
    for key in required_keys:
        if key not in config:
            print(f"Error: '{key}' is missing in the configuration.")
            return False
    return True

def _get_agent_status() -> str:
    try:
        client = docker.from_env()
        container = client.containers.get("optimus_abci_0")
        is_running = container.status == "running"
        return _color_bool(is_running, "Running", "Stopped")
    except docker.errors.NotFound:
        return _color_string("Not Found", ColorCode.RED)
    except docker.errors.DockerException as e:
        print(f"Error: Docker exception occurred - {str(e)}")
        return _color_string("Error", ColorCode.RED)
