# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2024 Valory AG
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
# ------------------------------------------------------------------------------
"""Meme-ooorr Quickstart script."""

import argparse
import getpass
import json
import os
import re
import shutil
import subprocess
import sys
import time
import typing as t
from dataclasses import dataclass
from pathlib import Path

import requests
import yaml
from aea.crypto.base import LedgerApi
from aea_ledger_ethereum import EthereumApi
from dotenv import load_dotenv
from git import Repo
from halo import Halo
from termcolor import colored
from web3 import Web3

from operate.account.user import UserAccount
from operate.cli import OperateApp
from operate.ledger.profiles import CONTRACTS, OLAS, STAKING
from operate.resource import LocalResource, deserialize
from operate.services.manage import ServiceManager
from operate.services.service import Service
from operate.types import (
    ChainType,
    ConfigurationTemplate,
    FundRequirementsTemplate,
    LedgerType,
    OnChainState,
    ServiceTemplate,
)
from scripts.twitter_verify import get_twitter_cookies, validate_twitter_credentials
from scripts.github import get_latest_tag


load_dotenv()

def unit_to_wei(unit: float) -> int:
    """Convert unit to Wei."""
    return int(unit * 1e18)

WALLET_TOPUP = unit_to_wei(0.005)
MASTER_SAFE_TOPUP = unit_to_wei(0.001)
SAFE_TOPUP = unit_to_wei(0.002)
AGENT_TOPUP = unit_to_wei(0.001)


COST_OF_BOND = 1
COST_OF_STAKING = 10 ** 20 # 100 OLAS
COST_OF_BOND_STAKING = 5 * 10 ** 19 # 50 OLAS
WARNING_ICON = colored('\u26A0', 'yellow')
REPO_ROOT = Path(__file__).resolve().parent
OPERATE_HOME = REPO_ROOT / ".memeooorr"

MEMEOOORR_REPO = "https://github.com/dvilelaf/meme-ooorr"
MEMEOOORR_REPO_DEFAULT_TAG = "v0.1.1"
MEMEOOORR_REPO_TAG = get_latest_tag("dvilelaf/meme-ooorr", MEMEOOORR_REPO_DEFAULT_TAG)

MEME_FACTORY_BASE = "0x42156841253f428cb644ea1230d4fddfb70f8891"
MEME_FACTORY_FORK = "0x1Aa15a8A751c601BbE31390dbb8711013BFD013d"

CHAIN_ID_TO_METADATA = {
    8453: {
        "name": "Base",
        "token": "ETH",
        "firstTimeTopUp": unit_to_wei(0.001),
        "operationalFundReq": unit_to_wei(0.001),
        "usdcRequired": False,
        "gasParams": {
            # this means default values will be used
            "MAX_PRIORITY_FEE_PER_GAS": "",
            "MAX_FEE_PER_GAS": "",
        }
    },
    42220: {
        "name": "Celo",
        "token": "ETH",
        "usdcRequired": False,
        "firstTimeTopUp": unit_to_wei(0.001),
        "operationalFundReq": unit_to_wei(0.001),
        "gasParams": {
            # this means default values will be used
            "MAX_PRIORITY_FEE_PER_GAS": "",
            "MAX_FEE_PER_GAS": "",
        }
    },
}


def estimate_priority_fee(
    web3_object: Web3,
    block_number: int,
    default_priority_fee: t.Optional[int],
    fee_history_blocks: int,
    fee_history_percentile: int,
    priority_fee_increase_boundary: int,
) -> t.Optional[int]:
    """Estimate priority fee from base fee."""

    if default_priority_fee is not None:
        return default_priority_fee

    fee_history = web3_object.eth.fee_history(
        fee_history_blocks, block_number, [fee_history_percentile]  # type: ignore
    )

    # This is going to break if more percentiles are introduced in the future,
    # i.e., `fee_history_percentile` param becomes a `List[int]`.
    rewards = sorted([reward[0] for reward in fee_history.get("reward", []) if reward[0] > 0])
    if len(rewards) == 0:
        return None

    # Calculate percentage increases from between ordered list of fees
    percentage_increases = [
        ((j - i) / i) * 100 if i != 0 else 0 for i, j in zip(rewards[:-1], rewards[1:])
    ]
    highest_increase = max(*percentage_increases)
    highest_increase_index = percentage_increases.index(highest_increase)

    values = rewards.copy()
    # If we have big increase in value, we could be considering "outliers" in our estimate
    # Skip the low elements and take a new median
    if (
        highest_increase > priority_fee_increase_boundary
        and highest_increase_index >= len(values) // 2
    ):
        values = values[highest_increase_index:]

    return values[len(values) // 2]


@dataclass
class MemeooorrConfig(LocalResource):
    """Local configuration."""

    path: Path
    base_rpc: t.Optional[str] = None
    password_migrated: t.Optional[bool] = None
    use_staking: t.Optional[bool] = None
    twikit_username: t.Optional[str] = None
    twikit_email: t.Optional[str] = None
    twikit_password: t.Optional[str] = None
    twikit_cookies: t.Optional[str] = None
    feedback_period_hours: t.Optional[str] = None
    gemini_api_key: t.Optional[str] = None
    min_feedback_replies: t.Optional[str] = None
    persona: t.Optional[str] = None
    home_chain_id: t.Optional[int] = None

    @classmethod
    def from_json(cls, obj: t.Dict) -> "LocalResource":
        """Load LocalResource from json."""
        kwargs = {}
        for pname, ptype in cls.__annotations__.items():
            if pname.startswith("_"):
                continue

            # allow for optional types
            is_optional_type = t.get_origin(ptype) is t.Union and type(None) in t.get_args(ptype)
            value = obj.get(pname, None)
            if is_optional_type and value is None:
                continue

            kwargs[pname] = deserialize(obj=obj[pname], otype=ptype)
        return cls(**kwargs)



def print_box(text: str, margin: int = 1, character: str = '=') -> None:
    """Print text centered within a box."""

    lines = text.split('\n')
    text_length = max(len(line) for line in lines)
    length = text_length + 2 * margin

    border = character * length
    margin_str = ' ' * margin

    print(border)
    print(f"{margin_str}{text}{margin_str}")
    print(border)
    print()


def print_title(text: str) -> None:
    """Print title."""
    print()
    print_box(text, 4, '=')


def print_section(text: str) -> None:
    """Print section."""
    print_box(text, 1, '-')


def wei_to_unit(wei: int) -> float:
    """Convert Wei to unit."""
    return wei / 1e18

def wei_to_token(wei: int, token: str = "ETH") -> str:
    """Convert Wei to token."""
    return f"{wei_to_unit(wei):.6f} {token}"


def ask_confirm_password() -> str:
    password = getpass.getpass("Please enter a password: ")
    confirm_password = getpass.getpass("Please confirm your password: ")

    if password == confirm_password:
        return password
    else:
        print("Passwords do not match. Terminating.")
        sys.exit(1)


def check_rpc(rpc_url: str) -> None:
    spinner = Halo(text=f"Checking RPC...", spinner="dots")
    spinner.start()

    rpc_data = {
        "jsonrpc": "2.0",
        "method": "eth_newFilter",
        "params": ["invalid"],
        "id": 1
    }

    try:
        response = requests.post(
            rpc_url,
            json=rpc_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        rpc_response = response.json()
    except Exception as e:
        print("Error: Failed to send RPC request:", e)
        sys.exit(1)

    rcp_error_message = rpc_response.get("error", {}).get("message", "Exception processing RCP response")

    if rcp_error_message == "Exception processing RCP response":
        print("Error: The received RCP response is malformed. Please verify the RPC address and/or RCP behavior.")
        print("  Received response:")
        print("  ", rpc_response)
        print("")
        print("Terminating script.")
        sys.exit(1)
    elif rcp_error_message == "Out of requests":
        print("Error: The provided RCP is out of requests.")
        print("Terminating script.")
        sys.exit(1)
    elif rcp_error_message == "The method eth_newFilter does not exist/is not available":
        print("Error: The provided RPC does not support 'eth_newFilter'.")
        print("Terminating script.")
        sys.exit(1)
    elif rcp_error_message == "invalid params":
        spinner.succeed("RPC checks passed.")
    else:
        print("Error: Unknown RCP error.")
        print("  Received response:")
        print("  ", rpc_response)
        print("")
        print("Terminating script.")
        sys.exit(1)

def input_with_default_value(prompt: str, default_value: str) -> str:
    user_input = input(f"{prompt} [{default_value}]: ")
    return str(user_input) if user_input else default_value

def input_select_chain(options: t.List[ChainType]):
    """Chose a single option from the offered ones"""
    user_input = input(f"Chose one of the following options {[option.name for option in options]}: ")
    try:
     return ChainType.from_string(user_input.upper())
    except ValueError:
        print("Invalid option selected. Please try again.")
        return input_select_chain(options)

def get_local_config() -> MemeooorrConfig:
    """Get local memeooorr configuration."""
    path = OPERATE_HOME / "local_config.json"

    if path.exists():
        memeooorr_config = MemeooorrConfig.load(path)
    else:
        memeooorr_config = MemeooorrConfig(path)

    print_section("API Key Configuration")

    if memeooorr_config.home_chain_id is None:
        print("Select the chain for you service")
        memeooorr_config.home_chain_id = input_select_chain([ChainType.BASE, ChainType.CELO]).id

    if memeooorr_config.base_rpc is None:
        memeooorr_config.base_rpc = input(f"Please enter a {ChainType.from_id(memeooorr_config.home_chain_id).name} RPC URL: ")

    if memeooorr_config.password_migrated is None:
        memeooorr_config.password_migrated = False

    if memeooorr_config.persona is None:
        memeooorr_config.persona = input_with_default_value("What's the agent persona", "a cat lover that is crazy about all-things cats")

    if memeooorr_config.feedback_period_hours is None:
        memeooorr_config.feedback_period_hours = input_with_default_value("How many hours should Memeooorr wait after sending a tweet and before analysing its responses?", 1)

    if memeooorr_config.min_feedback_replies is None:
        memeooorr_config.min_feedback_replies = input_with_default_value("What's the minimum amount of replies to a tweet before Memeooorr analyses them?", 10)

    if memeooorr_config.gemini_api_key is None:
        memeooorr_config.gemini_api_key = input("Please enter the gemini API key for Memeooorr's account: ")

    if memeooorr_config.twikit_username is None:
        twikit_username = input("Please enter the Twitter username for Memeooorr's account: ")
        twikit_username = twikit_username[1:] if twikit_username.startswith("@") else twikit_username
        memeooorr_config.twikit_username = twikit_username

    if memeooorr_config.twikit_email is None:
        memeooorr_config.twikit_email = input("Please enter the Twitter email for Memeooorr's account: ")

    if memeooorr_config.twikit_password is None:
        memeooorr_config.twikit_password = input("Please enter the Twitter password for Memeooorr's account (avoid passwords that include the $ character): ")

    memeooorr_config.twikit_cookies = get_twitter_cookies(
        memeooorr_config.twikit_username,
        memeooorr_config.twikit_email,
        memeooorr_config.twikit_password
    )

    memeooorr_config.store()
    return memeooorr_config


def apply_env_vars(env_vars: t.Dict[str, str]) -> None:
    """Apply environment variables."""
    for key, value in env_vars.items():
        if value is not None:
            os.environ[key] = str(value)

def handle_password_migration(operate: OperateApp, config: MemeooorrConfig) -> t.Optional[str]:
    """Handle password migration."""
    if not config.password_migrated:
        print("Add password...")
        old_password, new_password = "12345", ask_confirm_password()
        operate.user_account.update(old_password, new_password)
        if operate.wallet_manager.exists(LedgerType.ETHEREUM):
            operate.password = old_password
            wallet = operate.wallet_manager.load(LedgerType.ETHEREUM)
            wallet.crypto.dump(str(wallet.key_path), password=new_password)
            wallet.password = new_password
            wallet.store()

        config.password_migrated = True
        config.store()
        return new_password
    return None


def get_service_template(config: MemeooorrConfig) -> ServiceTemplate:
    """Get the service template"""
    return ServiceTemplate({
        "name": "Memeooorr",
        "hash": "",
        "description": f"Memeooorr @{config.twikit_username}",
        "image": "https://gateway.autonolas.tech/ipfs/QmQYDGMg8m91QQkTWSSmANs5tZwKrmvUCawXZfXVVWQPcu",
        "service_version": 'v0.0.1',
        "home_chain_id": str(config.home_chain_id),
        "configurations": {
            str(config.home_chain_id): ConfigurationTemplate(
                {
                    "staking_program_id": "meme_alpha",
                    "rpc": config.base_rpc,
                    "nft": "bafybeiaakdeconw7j5z76fgghfdjmsr6tzejotxcwnvmp3nroaw3glgyve",
                    "cost_of_bond": COST_OF_BOND,
                    "threshold": 1,
                    "use_staking": True,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": AGENT_TOPUP,
                            "safe": SAFE_TOPUP,
                        }
                    ),
                }
            ),
        },
})


def get_erc20_balance(ledger_api: LedgerApi, token: str, account: str) -> int:
    """Get ERC-20 token balance of an account."""
    web3 = t.cast(EthereumApi, ledger_api).api

    # ERC20 Token Standard Partial ABI
    erc20_abi = [
        {
            "constant": True,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "type": "function",
        }
    ]

    # Create contract instance
    contract = web3.eth.contract(address=web3.to_checksum_address(token), abi=erc20_abi)

    # Get the balance of the account
    balance = contract.functions.balanceOf(web3.to_checksum_address(account)).call()

    return balance

celo_staking_fallback = dict(
    agent_ids=[43],
    service_registry=CONTRACTS[ChainType.CELO]["service_registry"],  # nosec
    staking_token=STAKING[ChainType.CELO]["meme_alpha"],  # nosec
    service_registry_token_utility=CONTRACTS[ChainType.CELO]["service_registry_token_utility"],  # nosec
    min_staking_deposit=COST_OF_STAKING,
    activity_checker="0xAe2f766506F6BDF740Cc348a90139EF317Fa7Faf"  # nosec
)
base_staking_fallback = dict(
    agent_ids=[43],
    service_registry=CONTRACTS[ChainType.BASE]["service_registry"],  # nosec
    staking_token=STAKING[ChainType.BASE]["meme_alpha"],  # nosec
    service_registry_token_utility=CONTRACTS[ChainType.BASE]["service_registry_token_utility"],  # nosec
    min_staking_deposit=COST_OF_STAKING,
    activity_checker="0xAe2f766506F6BDF740Cc348a90139EF317Fa7Faf"  # nosec
)

FALLBACK_STAKING_PARAMS = {
    ChainType.CELO: celo_staking_fallback,
    ChainType.BASE: base_staking_fallback,
}

def add_volumes(docker_compose_path: Path, host_path: str, container_path: str) -> None:
    """Add volumes to the docker-compose."""
    with open(docker_compose_path, "r") as f:
        docker_compose = yaml.safe_load(f)

    docker_compose["services"]["memeooorr_abci_0"]["volumes"].append(f"{host_path}:{container_path}:Z")

    with open(docker_compose_path, "w") as f:
        yaml.dump(docker_compose, f)


def get_service(manager: ServiceManager, template: ServiceTemplate) -> Service:
    if len(manager.json) > 0:
        old_hash = manager.json[0]["hash"]
        if old_hash == template["hash"]:
            print(f'Loading service {template["hash"]}')
            service = manager.load_or_create(
                hash=template["hash"],
                service_template=template,
            )
        else:
            print(f"Updating service from {old_hash} to " + template["hash"])
            service = manager.update_service(
                old_hash=old_hash,
                new_hash=template["hash"],
                service_template=template,
            )
    else:
        print(f'Creating service {template["hash"]}')
        service = manager.load_or_create(
            hash=template["hash"],
            service_template=template,
        )

    return service

def fetch_token_price(url: str, headers: dict) -> t.Optional[float]:
    """Fetch the price of a token from a given URL."""
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error fetching info from url {url}. Failed with status code: {response.status_code}")
            return None
        prices = response.json()
        token = next(iter(prices))
        return prices[token].get('usd', None)
    except Exception as e:
        print(f"Error fetching token price: {e}")
        return None


def update_yaml_field(file_path: Path, field: str, new_value: str) -> None:
    """Updates a field in the first document of a YAML file."""

    print(f"Updating field '{field}' in '{file_path}'...")

    with open(file_path, 'r', encoding="utf-8") as file:
        documents = list(yaml.safe_load_all(file))

    if field in documents[0]:
        documents[0][field] = new_value
    else:
        raise KeyError(f"Field '{field}' not found in the first document of {file_path}.")

    with open(file_path, 'w', encoding="utf-8") as file:
        yaml.dump_all(documents, file, default_flow_style=False, sort_keys=False)


def clone_or_update_git_repo(repo_url: str, tag: t.Optional[str] = None, path: t.Optional[Path] = None) -> None:
    """Clones a GitHub repository at a specific tag or updates it if it already exists."""

    repo_name = repo_url.split('/')[-1].replace('.git', '')
    repo_path = (path or Path.cwd()) / repo_name

    if repo_path.exists():
        print(f"Repository '{repo_name}' exists. Fetching updates...")
        repo = Repo(repo_path)
        origin = repo.remotes.origin
        origin.fetch()
        branch_or_tag = tag or "main"
        repo.git.checkout(branch_or_tag, force=True)
        if tag is None:
            origin.pull(branch_or_tag, force=True)
    else:
        print(f"Cloning repository '{repo_name}'...")
        repo = Repo.clone_from(repo_url, repo_path)
        if tag:
            repo.git.checkout(tag)


def autonomy_publish(path: Path) -> t.Optional[str]:
    """Execute autonomy publish command."""

    print("Publishing service to IPFS...")
    if not os.path.isdir(path):
        print(f"The directory {path} does not exist.")
        return None

    result = subprocess.run(["autonomy", "publish"], capture_output=True, text=True, cwd=path, check=True)

    match = re.search(r"Package hash: (\S+)", result.stdout)
    if match:
        package_hash = match.group(1)
        print(f"Package hash: {package_hash}")
        return package_hash
    else:
        print("Package hash not found in the output.")
        return None


def main() -> None:
    """Run service."""

    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--terminate',
        action='store_true',
        help='Set this flag to terminate the process'
    )

    args = parser.parse_args()

    print_title("Memeooorr Quickstart")
    print("This script will assist you in setting up and running the Memeooorr service.")
    print()

    print_section("Set up local user account")
    operate = OperateApp(
        home=OPERATE_HOME,
    )
    operate.setup()

    memeooorr_config = get_local_config()
    template = get_service_template(memeooorr_config)

    # Customizing and publishing the Open Autonomy service
    print("")
    print_section("Customizing Open Autonomy service")
    clone_or_update_git_repo(MEMEOOORR_REPO, tag=MEMEOOORR_REPO_TAG, path=OPERATE_HOME / "git_repos")
    service_path = OPERATE_HOME / "git_repos" / "meme-ooorr" / "packages" / "dvilela" / "services" / "memeooorr"
    update_yaml_field(service_path / "service.yaml", "description", template["description"])
    package_hash = autonomy_publish(service_path)
    if package_hash:
        template["hash"] = package_hash

    manager = operate.service_manager()
    service = get_service(manager, template)
    print("")

    # Create a new account
    if operate.user_account is None:
        print("Creating a new local user account...")
        password = ask_confirm_password()
        UserAccount.new(
            password=password,
            path=operate._path / "user.json",
        )
        memeooorr_config.password_migrated = True
        memeooorr_config.store()

    # Load account
    else:
        password = handle_password_migration(operate, memeooorr_config)
        if password is None:
            password = getpass.getpass("Enter local user account password: ")
        if not operate.user_account.is_valid(password=password):
            print("Invalid password!")
            sys.exit(1)

    operate.password = password

    # Create the main wallet
    if not operate.wallet_manager.exists(ledger_type=LedgerType.ETHEREUM):
        print("Creating the main wallet...")
        wallet, mnemonic = operate.wallet_manager.create(ledger_type=LedgerType.ETHEREUM)
        wallet.password = password
        print()
        print_box(f"Please save the mnemonic phrase for the main wallet:\n{', '.join(mnemonic)}", 0, '-')
        input("Press enter to continue...")

    # Load the main wallet
    else:
        wallet = operate.wallet_manager.load(ledger_type=LedgerType.ETHEREUM)

    manager = operate.service_manager()

    if args.terminate:
        print_section("Terminating on-chain service")
        manager._terminate_service_on_chain_from_safe(service.hash, service.home_chain_id)
        return

    # Iterate the chain configs
    for chain_id, configuration in service.chain_configs.items():
        chain_metadata = CHAIN_ID_TO_METADATA[int(chain_id)]
        chain_config = service.chain_configs[chain_id]
        chain_type = chain_config.ledger_config.chain
        ledger_api = wallet.ledger_api(
            chain_type=chain_type,
            rpc=chain_config.ledger_config.rpc,
        )
        os.environ["CUSTOM_CHAIN_RPC"] = chain_config.ledger_config.rpc
        os.environ["OPEN_AUTONOMY_SUBGRAPH_URL"] = "https://subgraph.autonolas.tech/subgraphs/name/autonolas-staging"
        os.environ["MAX_PRIORITY_FEE_PER_GAS"] = chain_metadata["gasParams"]["MAX_PRIORITY_FEE_PER_GAS"]
        os.environ["MAX_FEE_PER_GAS"] = chain_metadata["gasParams"]["MAX_FEE_PER_GAS"]
        service_exists = manager._get_on_chain_state(chain_config) != OnChainState.NON_EXISTENT

        chain_name, token = chain_metadata['name'], chain_metadata["token"]
        balance_str = wei_to_token(ledger_api.get_balance(wallet.crypto.address), token)
        print(
            f"[{chain_name}] Main wallet balance: {balance_str}",
        )
        safe_exists = wallet.safes.get(chain_type) is not None
        required_balance = chain_metadata["firstTimeTopUp"] if not safe_exists else chain_metadata["operationalFundReq"]
        print(
            f"[{chain_name}] Please make sure main wallet {wallet.crypto.address} has at least {wei_to_token(required_balance, token)}",
        )
        spinner = Halo(
            text=f"[{chain_name}] Waiting for funds...",
            spinner="dots"
        )
        spinner.start()

        while ledger_api.get_balance(wallet.crypto.address) < required_balance:
            time.sleep(1)

        spinner.succeed(f"[{chain_name}] Main wallet updated balance: {wei_to_token(ledger_api.get_balance(wallet.crypto.address), token)}.")
        print()

        # Create the master safe
        if not safe_exists:
            print(f"[{chain_name}] Creating Safe")
            ledger_type = LedgerType.ETHEREUM
            wallet_manager = operate.wallet_manager
            wallet = wallet_manager.load(ledger_type=ledger_type)

            wallet.create_safe(  # pylint: disable=no-member
                chain_type=chain_type,
                rpc=chain_config.ledger_config.rpc,
            )

        print_section(f"[{chain_name}] Set up the service in the Olas Protocol")

        address = wallet.safes[chain_type]
        if not service_exists:
            first_time_top_up = chain_metadata["firstTimeTopUp"]
            print(
                f"[{chain_name}] Please make sure master safe address {address} has at least {wei_to_token(first_time_top_up, token)}."
            )
            spinner = Halo(
                text=f"[{chain_name}] Waiting for funds...",
                spinner="dots",
            )
            spinner.start()

            while ledger_api.get_balance(address) < first_time_top_up:
                print(f"[{chain_name}] Funding Safe")
                wallet.transfer(
                    to=t.cast(str, wallet.safes[chain_type]),
                    amount=int(chain_metadata["firstTimeTopUp"]),
                    chain_type=chain_type,
                    from_safe=False,
                    rpc=chain_config.ledger_config.rpc,
                )
                time.sleep(1)

            spinner.succeed(f"[{chain_name}] Safe updated balance: {wei_to_token(ledger_api.get_balance(address), token)}.")

        if chain_config.chain_data.user_params.use_staking and not service_exists:
            olas_address = OLAS[chain_type]
            print(f"[{chain_name}] Please make sure address {address} has at least {wei_to_token(COST_OF_STAKING + COST_OF_BOND_STAKING, olas_address)}")

            spinner = Halo(
                text=f"[{chain_name}] Waiting for {olas_address}...",
                spinner="dots",
            )
            spinner.start()

            while get_erc20_balance(ledger_api, olas_address, address) < COST_OF_STAKING + COST_OF_BOND_STAKING:
                time.sleep(1)

            balance = get_erc20_balance(ledger_api, olas_address, address) / 10 ** 18
            spinner.succeed(f"[{chain_name}] Safe updated balance: {balance} {olas_address}")

        manager.deploy_service_onchain_from_safe_single_chain(
            hash=service.hash,
            chain_id=chain_id,
            fallback_staking_params=FALLBACK_STAKING_PARAMS[chain_type],
        )

        # Fund the service
        manager.fund_service(
            hash=service.hash,
            chain_id=chain_id,
            safe_fund_treshold=SAFE_TOPUP,
            safe_topup=SAFE_TOPUP
        )

    safes = {
        ChainType.from_id(int(chain)).name.lower(): config.chain_data.multisig
        for chain, config in service.chain_configs.items()
    }
    home_chain_id = service.home_chain_id
    home_chain_type = ChainType.from_id(int(home_chain_id))

    # Validate twitter cookies
    is_valid_cookies, new_cookies = validate_twitter_credentials()
    if not is_valid_cookies:
        memeooorr_config.twikit_cookies = new_cookies
        memeooorr_config.store()

    # Apply env cars
    env_vars = {
        "SAFE_CONTRACT_ADDRESSES": json.dumps(safes, separators=(',', ':')),
        # "ON_CHAIN_SERVICE_ID": "34",
        "TWIKIT_USERNAME": memeooorr_config.twikit_username,
        "TWIKIT_EMAIL": memeooorr_config.twikit_email,
        "TWIKIT_PASSWORD": memeooorr_config.twikit_password,
        "TWIKIT_COOKIES": memeooorr_config.twikit_cookies,
        "FEEDBACK_PERIOD_HOURS": memeooorr_config.feedback_period_hours,
        "GENAI_API_KEY": memeooorr_config.gemini_api_key,
        "MIN_FEEDBACK_REPLIES": memeooorr_config.min_feedback_replies,
        "PERSONA": memeooorr_config.persona,
        "RESET_PAUSE_DURATION": 3600,
        "MEME_FACTORY_ADDRESS": MEME_FACTORY_BASE,
        "MINIMUM_GAS_BALANCE": 0.02,
        "DB_PATH": "/logs/memeooorr.db",
        "TWIKIT_COOKIES_PATH": "/logs/twikit_cookies.json",
        "STAKING_TOKEN_CONTRACT_ADDRESS": STAKING[home_chain_type]["meme_alpha"],
        "HOME_CHAIN_ID": home_chain_id
    }
    apply_env_vars(env_vars)

    # Build the deployment
    print("Skipping local deployment")
    service.deployment.build(use_docker=True, force=True, chain_id=home_chain_id)

    # Add docker volumes
    docker_compose_path = service.path / "deployment" / "docker-compose.yaml"
    add_volumes(docker_compose_path, str(OPERATE_HOME), "/data")

    # Copy the database and cookies if they exist
    database_source = REPO_ROOT / "memeooorr.db"
    database_target = service.path / "deployment" / "persistent_data" / "logs" / "memeooorr.db"
    if database_source.is_file():
        print("Loaded a backup of the db")
        shutil.copy(database_source, database_target)

    cookies_source = REPO_ROOT / "twikit_cookies.json"
    cookies_target = service.path / "deployment" / "persistent_data" / "logs" / "twikit_cookies.json"
    if cookies_source.is_file():
        print("Loaded a backup of the cookies")
        shutil.copy(cookies_source, cookies_target)

    # Run the deployment
    service.deployment.start(use_docker=True)
    print()
    print_section("Running the service")


if __name__ == "__main__":
    main()
