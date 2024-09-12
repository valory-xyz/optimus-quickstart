import json
from datetime import datetime
from pathlib import Path
from web3 import Web3
import docker
# Import necessary functions and constants from run_service.py
from run_service import (
    get_local_config,
    get_service_template,
    wei_to_token,
    get_erc20_balance,
    CHAIN_ID_TO_METADATA,
    USDC_ADDRESS,
    OPERATE_HOME,
    OptimusConfig,
)

# Import necessary functions from wallet_info.py
from wallet_info import save_wallet_info
from staking_report import staking_report
# Existing imports and functions...
OUTPUT_WIDTH = 80


class ColorCode:
    """Terminal color codes"""

    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"


def _color_string(text: str, color_code: str) -> str:
    return f"{color_code}{text}{ColorCode.RESET}"


def _color_bool(
    is_true: bool, true_string: str = "True", false_string: str = "False"
) -> str:
    if is_true:
        return _color_string(true_string, ColorCode.GREEN)
    return _color_string(false_string, ColorCode.RED)


def _color_percent(p: float, multiplier: float = 100, symbol: str = "%") -> str:
    if p >= 0:
        return f"{p*multiplier:.2f} {symbol}"
    return _color_string(f"{p*multiplier:.2f} {symbol}", ColorCode.RED)

def _print_section_header(header: str) -> None:
    print("\n\n" + header)
    print("=" * OUTPUT_WIDTH)


def _print_subsection_header(header: str) -> None:
    print("\n" + header)
    print("-" * OUTPUT_WIDTH)


def _print_status(key: str, value: str, message: str = "") -> None:
    print(f"{key:<30}{value:<10} {message or ''}")

def _get_agent_status() -> str:
    client = docker.from_env()
    optmius_abci_container = (
        client.containers.get("optimus_abci_0")
        if "optimus_abci_0" in [c.name for c in client.containers.list()]
        else None
    )
    is_running = optmius_abci_container 
    return _color_bool(is_running, "Running", "Stopped")    

def wei_to_unit(wei: int) -> float:
    """Convert Wei to unit."""
    return wei / 1e18


def wei_to_token(wei: int, token: str = "xDAI") -> str:
    """Convert Wei to token."""
    return f"{wei_to_unit(wei):.2f} {token}"

def wei_to_olas(wei: int) -> str:
    """Converts and formats wei to WxDAI."""
    return "{:.2f} OLAS".format(wei_to_unit(wei))

def _warning_message(current_value: int, threshold: int = 0, message: str = "") -> str:
    default_message = _color_string(
        f"- Balance too low. Threshold is {wei_to_unit(threshold):.2f}.",
        ColorCode.YELLOW,
    )
    if current_value < threshold:
        return (
            _color_string(f"{message}", ColorCode.YELLOW)
            if message
            else default_message
        )
    return ""

def load_wallet_info():
    save_wallet_info()
    file_path = OPERATE_HOME / "wallets" / "wallet_info.json"
    with open(file_path, "r") as f:
        return json.load(f)

def load_config():
    optimus_config = get_local_config()
    service_template = get_service_template(optimus_config)
    service_hash = service_template["hash"]

    config_path = OPERATE_HOME / f"services/{service_hash}/config.json"
    with open(config_path, "r") as f:
        return json.load(f)

def load_operator_address():
    ethereum_json_path = OPERATE_HOME / "wallets" / "ethereum.json"
    with open(ethereum_json_path, "r") as f:
        ethereum_data = json.load(f)
    # Pick the address from safes where safe chain is 4
    return ethereum_data["safes"]["4"]

def check_service_status():
    # Placeholder for actual status checking logic
    return "Stopped"

def wei_to_eth(wei_value):
    return Web3.from_wei(wei_value, 'ether')

def generate_report():
    # First, update the wallet info
    wallet_info = load_wallet_info()
    
    operator_address = load_operator_address()
    config = load_config()
    # Service Report Header
    print("")
    print("==============")
    print("Optimus Service report")
    print("Generated on: ", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print("==============")
    # Now load the updated wallet info


    staking_report(config)
    home_chain_id = config.get("home_chain_id")
    service_id = config["chain_configs"][home_chain_id]["chain_data"]["token"]



    # Service Section
    _print_section_header("Service")
    _print_status("ID", str(service_id))

    # Agent Section
    agent_status = _get_agent_status()
    _print_subsection_header("Agent")
    _print_status("Status (on this machine)", agent_status)
    _print_status("Address", wallet_info['main_wallet_address'])
    # _print_status(
    #     " Balance",
    #     f"{wei_to_xdai(agent_xdai)} {_warning_message(agent_xdai, AGENT_XDAI_BALANCE_THRESHOLD)}",
    # )  #to-do warning message and threshold
    
    
    # Agent balances across chains
    for chain_id, chain_config in config["chain_configs"].items():
        chain_name = CHAIN_ID_TO_METADATA[int(chain_id)]["name"]
        balance_info = wallet_info['main_wallet_balances'].get(chain_name, {})
        _print_status(f"{chain_name} Balance",f"{balance_info.get('balance_formatted', 'N/A')}")
        # Get the agent threshold from the config
        ######TO-DO get the agent threshold from the config
        # agent_threshold_wei = chain_config["chain_data"]["user_params"]["fund_requirements"]["agent"]
        # agent_threshold = f"{wei_to_eth(agent_threshold_wei):.3f} ETH"
        
        # # Check for low balance
        # current_balance = float(balance_info.get('balance_formatted', '0').split()[0])
        # if current_balance < float(agent_threshold.split()[0]):
        #     report.append(f"Agent - Balance too low. Threshold is {agent_threshold}.")
    
    # report.append("")

    # # Safe Section
    _print_subsection_header("Safe")
    for chain_id, chain_config in config["chain_configs"].items():
        chain_name = CHAIN_ID_TO_METADATA[int(chain_id)]["name"]
        safe_info = wallet_info['safe_balances'].get(chain_name, {})
        _print_status(f"Address ({chain_name})",f"{safe_info.get('address', 'N/A')}")
        _print_status(f"{safe_info.get('token', 'ETH')} Balance",f"{safe_info.get('balance_formatted', 'N/A')}")
        
        if 'usdc_balance' in safe_info:
            _print_status("USDC Balance",safe_info['usdc_balance_formatted'])
        print("              ")
        ######  TO-DO Low balance check
    #     # Get the safe threshold from the config
    #     safe_threshold_wei = chain_config["chain_data"]["user_params"]["fund_requirements"]["safe"]
    #     safe_threshold = f"{wei_to_eth(safe_threshold_wei):.3f} ETH"
        
    #     # Check for low balance
    #     current_balance = float(safe_info.get('balance_formatted', '0').split()[0])
    #     if current_balance < float(safe_threshold.split()[0]):
    #         report.append(f"Safe - Balance too low. Threshold is {safe_threshold}.")
        
    #     report.append("")

    # # Owner/Operator Section
    _print_subsection_header("Owner/Operator")
    _print_status("Address", operator_address)
    for chain_name, balance_info in wallet_info['main_wallet_balances'].items():
        _print_status(f"{chain_name} Balance",balance_info['balance_formatted'])
    #     report.append(f"{chain_name} Balance           {balance_info['balance_formatted']}")



if __name__ == "__main__":
    generate_report()
