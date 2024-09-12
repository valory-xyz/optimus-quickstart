import json
import math
from datetime import datetime
from pathlib import Path
from web3 import Web3
from argparse import ArgumentParser
from dotenv import dotenv_values
from enum import Enum
from pathlib import Path
import requests
import sys
from typing import Any, List
from operate.ledger.profiles import STAKING
from operate.types import ChainType
# Import necessary functions and constants from run_service.py
from run_service import (
    get_local_config,
    get_service_template,
    wei_to_token,
    get_erc20_balance,
    CHAIN_ID_TO_METADATA,
    USDC_ADDRESS,
    OPERATE_HOME,
    FALLBACK_STAKING_PARAMS,
    OptimusConfig
)


from web3 import HTTPProvider, Web3

SCRIPT_PATH = Path(__file__).resolve().parent
STAKING_TOKEN_JSON_PATH = Path(
    SCRIPT_PATH,
    "contracts",
    "StakingToken.json",
)
ACTIVITY_CHECKER_JSON_PATH = Path(
    SCRIPT_PATH,
    "contracts",
    "StakingActivityChecker.json",
)
SERVICE_REGISTRY_L2_JSON_PATH = Path(
    SCRIPT_PATH,
    "contracts",
    "ServiceRegistryL2.json",
)
SERVICE_REGISTRY_TOKEN_UTILITY_JSON_PATH = Path(
    SCRIPT_PATH,
    "contracts",
    "ServiceRegistryTokenUtility.json",
)

OUTPUT_WIDTH = 80

class ColorCode:
    """Terminal color codes"""

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

def load_operator_address():
    ethereum_json_path = OPERATE_HOME / "wallets" / "ethereum.json"
    with open(ethereum_json_path, "r") as f:
        ethereum_data = json.load(f)
    # Pick the address from safes where safe chain is 4
    return ethereum_data["safes"]["4"]

def staking_report(config: dict) -> None:

    _print_section_header("Performance")
    _print_subsection_header("Staking")
    operator_address = load_operator_address()
    chain_data = next(
        (data for data in config["chain_configs"].values() if data["chain_data"]["user_params"]["use_staking"]),
        None
    )
    if not chain_data:
        print("No staking configuration found where use_staking is true.")
        return

    rpc = chain_data["ledger_config"]["rpc"]
    staking_program_id = chain_data["chain_data"]["user_params"]["staking_program_id"]
    home_chain_id = config.get("home_chain_id")
    service_id = config["chain_configs"][home_chain_id]["chain_data"]["token"]
    multisig_address = config["chain_configs"][home_chain_id]["chain_data"]["multisig"]
    w3 = Web3(HTTPProvider(rpc))
    #staking_token_address = "0x88996bbdE7f982D93214881756840cE2c77C4992"
    staking_token_address = STAKING[ChainType.OPTIMISM]["optimus_alpha"]
    with open(STAKING_TOKEN_JSON_PATH, "r", encoding="utf-8") as file:
        staking_token_data = json.load(file)

    staking_token_abi = staking_token_data.get("abi", [])
    staking_token_contract = w3.eth.contract(
        address=staking_token_address, abi=staking_token_abi  # type: ignore
    )
    staking_state = StakingState(
        staking_token_contract.functions.getStakingState(
            service_id  # how to get service id and how it knows that on that service id the service is stacked
        ).call()
    )
    is_staked = (
        staking_state == StakingState.STAKED
        or staking_state == StakingState.EVICTED
    )
    _print_status("Is service staked?", _color_bool(is_staked, "Yes", "No"))
    if is_staked:
        _print_status("Staking program", staking_program_id)  # type: ignore # how to get the staking program? from config file under stacking program id?
    if staking_state == StakingState.STAKED:
        _print_status("Staking state", staking_state.name)
    elif staking_state == StakingState.EVICTED:
        _print_status("Staking state", _color_string(staking_state.name, ColorCode.RED))

    if is_staked:

        activity_checker_address = staking_token_contract.functions.activityChecker().call()
        with open(ACTIVITY_CHECKER_JSON_PATH, "r", encoding="utf-8") as file:
            activity_checker_data = json.load(file)

        activity_checker_abi = activity_checker_data.get("abi", [])
        activity_checker_contract = w3.eth.contract(
            address=activity_checker_address, abi=activity_checker_abi  # type: ignore
        )

        with open(
            SERVICE_REGISTRY_TOKEN_UTILITY_JSON_PATH, "r", encoding="utf-8"
        ) as file:
            service_registry_token_utility_data = json.load(file)

        service_registry_token_utility_contract_address = (
            staking_token_contract.functions.serviceRegistryTokenUtility().call()
        )
        service_registry_token_utility_abi = (
            service_registry_token_utility_data.get("abi", [])
        )
        service_registry_token_utility_contract = w3.eth.contract(
            address=service_registry_token_utility_contract_address,
            abi=service_registry_token_utility_abi,
        )

        security_deposit = (
            service_registry_token_utility_contract.functions.getOperatorBalance(
                operator_address, service_id
            ).call()
        )

        agent_bond = service_registry_token_utility_contract.functions.getAgentBond(
            service_id, FALLBACK_STAKING_PARAMS["agent_ids"][0]
        ).call()
        min_staking_deposit = (
            staking_token_contract.functions.minStakingDeposit().call()
        )


        min_security_deposit = min_staking_deposit
        _print_status(
            "Staked (security deposit)",
            f"{wei_to_olas(security_deposit)} {_warning_message(security_deposit, min_security_deposit)}",
        )
        _print_status(
            "Staked (agent bond)",
            f"{wei_to_olas(agent_bond)} {_warning_message(agent_bond, min_staking_deposit)}",
        )

        service_info = staking_token_contract.functions.mapServiceInfo(
            service_id
        ).call()
        rewards = service_info[3]
        _print_status("Accrued rewards", f"{wei_to_olas(rewards)}") 

        liveness_ratio = (
                activity_checker_contract.functions.livenessRatio().call()
            )
        multisig_nonces_24h_threshold = math.ceil(
                (liveness_ratio * 60 * 60 * 24) / 10**18
            )   

        multisig_nonces = activity_checker_contract.functions.getMultisigNonces(multisig_address).call()
        multisig_nonces = multisig_nonces[0]
        service_info = staking_token_contract.functions.getServiceInfo(service_id).call()
        multisig_nonces_on_last_checkpoint = service_info[2][0]
        multisig_nonces_since_last_cp = (
            multisig_nonces - multisig_nonces_on_last_checkpoint
        )
        multisig_nonces_current_epoch = multisig_nonces_since_last_cp
        _print_status(
                "Num. txs current epoch",
                f"{multisig_nonces_current_epoch} {_warning_message(multisig_nonces_current_epoch, multisig_nonces_24h_threshold, f'- Too low. Threshold is {multisig_nonces_24h_threshold}.')}",
            )

if __name__ == "__main__":
    with open("./.optimus/services/bafybeie4mwft76qkajsn3wypza5vcpvx5vdaosywqzzsnohr4my6o2xu3y/config.json", "r") as f:
        config = json.load(f)
    staking_report(config)

