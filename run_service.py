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
"""Optimus Quickstart script."""

import getpass
import json
import os
import sys
import time
import typing as t
import math
from dataclasses import dataclass
from pathlib import Path
from decimal import Decimal, ROUND_UP

import requests
import yaml
from aea.crypto.base import LedgerApi
from aea_ledger_ethereum import EthereumApi, EIP1559, get_base_fee_multiplier
from dotenv import load_dotenv
from eth_utils import to_wei
from halo import Halo
from termcolor import colored
from web3 import Web3
from web3.types import Wei, TxParams

from operate.account.user import UserAccount
from operate.cli import OperateApp
from operate.ledger.profiles import OLAS, STAKING
from operate.resource import LocalResource, deserialize
from operate.services.manage import ServiceManager
from operate.services.service import Service
from operate.types import (
    LedgerType,
    ServiceTemplate,
    ConfigurationTemplate,
    FundRequirementsTemplate, ChainType, OnChainState,
)

load_dotenv()

SUGGESTED_TOP_UP_DEFAULT = 1_000_000_000_000_000
SUGGESTED_SAFE_TOP_UP_DEFAULT = 5_000_000_000_000_000
MASTER_WALLET_MIMIMUM_BALANCE = 6_001_000_000_000_000
COST_OF_BOND = 1
COST_OF_BOND_STAKING = 2 * 10 ** 19
STAKED_BONDING_TOKEN = "OLAS"
INITIAL_FUNDS_REQUIREMENT = {"USDC": 15_000_000, "ETH": 6_000_000_000_000_000}
USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
WARNING_ICON = colored('\u26A0', 'yellow')
OPERATE_HOME = Path.cwd() / ".optimus"
DEFAULT_MIN_SWAP_AMOUNT_THRESHOLD = 15
DEFAULT_CHAINS = ["optimism","base"]
STAKING_CHAINS = ["optimism"]
DEFAULT_START_CHAIN = "Ethereum Mainnet"
CHAIN_ID_TO_METADATA = {
    1: {
        "name": "Ethereum Mainnet",
        "token": "ETH",
        "native_token_balance": MASTER_WALLET_MIMIMUM_BALANCE,
        "usdcRequired": True,
        "initialFundsRequirement": SUGGESTED_TOP_UP_DEFAULT * 10,
        "operationalFundReq": SUGGESTED_TOP_UP_DEFAULT * 10 * 2,
        "gasParams": {
            # this means default values will be used
            "MAX_PRIORITY_FEE_PER_GAS": "",
            "MAX_FEE_PER_GAS": "",
        }
    },
    10: {
        "name": "Optimism",
        "token": "ETH",
        "usdcRequired": False,
        "initialFundsRequirement": 0,
        "operationalFundReq": SUGGESTED_TOP_UP_DEFAULT * 5,
        "gasParams": {
            # this means default values will be used
            "MAX_PRIORITY_FEE_PER_GAS": "",
            "MAX_FEE_PER_GAS": "",
        }
    },
    8453: {
        "name": "Base",
        "token": "ETH",
        "initialFundsRequirement": 0,
        "operationalFundReq": SUGGESTED_TOP_UP_DEFAULT * 5,
        "usdcRequired": False,
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
class OptimusConfig(LocalResource):
    """Local configuration."""

    path: Path
    optimism_rpc: t.Optional[str] = None
    ethereum_rpc: t.Optional[str] = None
    base_rpc: t.Optional[str] = None
    tenderly_access_key: t.Optional[str] = None
    tenderly_account_slug: t.Optional[str] = None
    tenderly_project_slug: t.Optional[str] = None
    coingecko_api_key: t.Optional[str] = None
    min_swap_amount_threshold: t.Optional[int] = None
    password_migrated: t.Optional[bool] = None
    use_staking: t.Optional[bool] = None
    allowed_chains: t.Optional[list[str]] = None

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


def wei_to_token(wei: int, token: str = "xDAI") -> str:
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


def get_local_config() -> OptimusConfig:
    """Get local optimus configuration."""
    path = OPERATE_HOME / "local_config.json"
    if path.exists():
        optimus_config = OptimusConfig.load(path)
    else:
        optimus_config = OptimusConfig(path)

    print_section("API Key Configuration")

    if optimus_config.ethereum_rpc is None:
        optimus_config.ethereum_rpc = input("Please enter an Ethereum RPC URL: ")

    if optimus_config.optimism_rpc is None:
        optimus_config.optimism_rpc = input("Please enter an Optimism RPC URL: ")

    if optimus_config.base_rpc is None:
        optimus_config.base_rpc = input("Please enter a Base RPC URL: ")

    if optimus_config.tenderly_access_key is None:
        optimus_config.tenderly_access_key = input(
            "Please enter your Tenderly API Key. Get one at https://dashboard.tenderly.co/: "
        )

    if optimus_config.tenderly_account_slug is None:
        optimus_config.tenderly_account_slug = input(
            "Please enter your Tenderly Account Slug: "
        )

    if optimus_config.tenderly_project_slug is None:
        optimus_config.tenderly_project_slug = input(
            "Please enter your Tenderly Project Slug: "
        )

    if optimus_config.coingecko_api_key is None:
        optimus_config.coingecko_api_key = input(
            "Please enter your CoinGecko API Key. Get one at https://www.coingecko.com/: "
        )

    if optimus_config.min_swap_amount_threshold is None:
        update_min_swap = input(f"Do you want to update the minimum swap amount threshold (set to {DEFAULT_MIN_SWAP_AMOUNT_THRESHOLD} USD)? (y/n): ").lower() == 'y'
        if update_min_swap:
            while True:
                user_input = input(
                    f"Please enter the minimum swap amount threshold (at least {DEFAULT_MIN_SWAP_AMOUNT_THRESHOLD} USD): "
                )
                min_swap_amount = user_input
                if not min_swap_amount.isdigit():
                    print("Error: Please enter a valid integer.")
                    continue
                
                if int(min_swap_amount) >= DEFAULT_MIN_SWAP_AMOUNT_THRESHOLD:
                    optimus_config.min_swap_amount_threshold = min_swap_amount
                    break
                else:
                    print(f"Error: The minimum swap amount must be at least {DEFAULT_MIN_SWAP_AMOUNT_THRESHOLD} USD.")
        else:
            optimus_config.min_swap_amount_threshold = str(DEFAULT_MIN_SWAP_AMOUNT_THRESHOLD)

    if optimus_config.password_migrated is None:
        optimus_config.password_migrated = False

    if optimus_config.use_staking is None:
        optimus_config.use_staking = input("Do you want to stake your service? (y/n): ").lower() == 'y'

    if optimus_config.allowed_chains is None:
        update_chains = input("Do you want to restrict the operability to specific chains? (y/n): ").lower() == 'y'
        if update_chains:
            allowed_chains = []
            for chain in DEFAULT_CHAINS:
                if chain in STAKING_CHAINS:
                    allowed_chains.append(chain)
                    continue      
                operate_on_chain = input(f"Do you wish the service to operate on {chain}? (y/n): ").lower() == 'y'
                if operate_on_chain:
                    allowed_chains.append(chain)

            optimus_config.allowed_chains = allowed_chains
        else:
            optimus_config.allowed_chains = DEFAULT_CHAINS
            

    optimus_config.store()
    return optimus_config


def apply_env_vars(env_vars: t.Dict[str, str]) -> None:
    """Apply environment variables."""
    for key, value in env_vars.items():
        if value is not None:
            os.environ[key] = value

def handle_password_migration(operate: OperateApp, config: OptimusConfig) -> t.Optional[str]:
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


def get_service_template(config: OptimusConfig) -> ServiceTemplate:
    """Get the service template"""
    return ServiceTemplate({
        "name": "Optimus",
        "hash": "bafybeidlfxklqbwrba5xdbigchkl5dcqcrlpzbrkem62jbzr5yghwe7tgu",

        "description": "Optimus",
        "image": "https://gateway.autonolas.tech/ipfs/bafybeiaakdeconw7j5z76fgghfdjmsr6tzejotxcwnvmp3nroaw3glgyve",
        "service_version": 'v0.18.1',
        "home_chain_id": "10",
        "configurations": {
            "1": ConfigurationTemplate(
                {
                    "staking_program_id": "optimus_alpha",
                    "rpc": config.ethereum_rpc,
                    "nft": "bafybeiaakdeconw7j5z76fgghfdjmsr6tzejotxcwnvmp3nroaw3glgyve",
                    "cost_of_bond": COST_OF_BOND,
                    "threshold": 1,
                    "use_staking": False,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT * 5,
                            "safe": 0,
                        }
                    ),
                }
            ),
            "10": ConfigurationTemplate(
                {
                    "staking_program_id": "optimus_alpha",
                    "rpc": config.optimism_rpc,
                    "nft": "bafybeiaakdeconw7j5z76fgghfdjmsr6tzejotxcwnvmp3nroaw3glgyve",
                    "cost_of_bond": COST_OF_BOND_STAKING,
                    "threshold": 1,
                    "use_staking": config.use_staking,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT * 5,
                            "safe": 0,
                        }
                    ),
                }
            ),
            "8453": ConfigurationTemplate(
                {
                    "staking_program_id": "optimus_alpha",
                    "rpc": config.base_rpc,
                    "nft": "bafybeiaakdeconw7j5z76fgghfdjmsr6tzejotxcwnvmp3nroaw3glgyve",
                    "cost_of_bond": COST_OF_BOND,
                    "threshold": 1,
                    "use_staking": False,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT * 5,
                            "safe": 0,
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

FALLBACK_STAKING_PARAMS = dict(
    agent_ids=[40],
    service_registry="0x9338b5153AE39BB89f50468E608eD9d764B755fD",  # nosec
    staking_token="0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f",  # nosec
    service_registry_token_utility="0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8",  # nosec
    min_staking_deposit=20000000000000000000,
    activity_checker="0x155547857680A6D51bebC5603397488988DEb1c8"  # nosec
)

def add_volumes(docker_compose_path: Path, host_path: str, container_path: str) -> None:
    """Add volumes to the docker-compose."""
    with open(docker_compose_path, "r") as f:
        docker_compose = yaml.safe_load(f)

    docker_compose["services"]["optimus_abci_0"]["volumes"].append(f"{host_path}:{container_path}:Z")

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

def fetch_initial_funding_requirements() -> None:
    """Fetch initial funding requirements based on min_swap_amount_threshold."""
    global INITIAL_FUNDS_REQUIREMENT
    global CHAIN_ID_TO_METADATA

    optimus_config = get_local_config()
    headers = {
        "accept": "application/json",
        "x-cg-api-key": optimus_config.coingecko_api_key
    }

    # Fetch ETH price
    eth_url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    eth_price = fetch_token_price(eth_url, headers)
    if eth_price is None:
        print("Error: Could not fetch price for ETH.")
        return

    safety_margin = 500_000_000_000_000
    eth_required = (int(optimus_config.min_swap_amount_threshold) / eth_price)
    eth_required_rounded = float(Decimal(eth_required).quantize(Decimal('0.0001'), rounding=ROUND_UP))
    eth_required_in_wei = int((eth_required_rounded * 10 ** 18) + safety_margin)
    INITIAL_FUNDS_REQUIREMENT['ETH'] = eth_required_in_wei
    CHAIN_ID_TO_METADATA[1]['initialFundsRequirement'] = eth_required_in_wei

    # Fetch USDC price
    usdc_url = f"https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses={USDC_ADDRESS}&vs_currencies=usd"
    usdc_price = fetch_token_price(usdc_url, headers)
    if usdc_price is None:
        print("Error: Could not fetch price for USDC.")
        return
      
    safety_margin = 1_000_000
    usdc_required = (int(optimus_config.min_swap_amount_threshold) / usdc_price)
    usdc_required_rounded = math.ceil(usdc_required)
    usdc_required_in_decimals = int((usdc_required_rounded * 10 ** 6) + safety_margin)
    INITIAL_FUNDS_REQUIREMENT['USDC'] = usdc_required_in_decimals

def calculate_fund_requirement(rpc, fee_history_blocks: int, gas_amount: int, fee_history_percentile: int = 50) -> int:
    if rpc is None:
        return None
    
    web3 = Web3(Web3.HTTPProvider(rpc))
    block_number = web3.eth.block_number
    # Fetch fee history
    fee_history = web3.eth.fee_history(
        fee_history_blocks, block_number, [fee_history_percentile]
    )

    if fee_history is None:
        return None
    
    base_fees = fee_history.get('baseFeePerGas')
    if base_fees is None:
        return None

    priority_fees = [reward[0] for reward in fee_history.get('reward', []) if reward]
    if not priority_fees:
        return None
    
    # Calculate average fees
    average_base_fee = sum(base_fees) / len(base_fees)
    average_priority_fee = sum(priority_fees) / len(priority_fees)

    average_gas_price = average_base_fee + average_priority_fee

    safety_margin = 500_000_000_000_000
    fund_requirement = int((average_gas_price * gas_amount) + safety_margin)
    return fund_requirement

def fetch_agent_fund_requirement(chain_id, rpc, fee_history_blocks: int = 20) -> int:
    if int(chain_id) == 1:
        gas_amount = 1_000_000
    else:
        gas_amount = 5_000_000
    return calculate_fund_requirement(rpc, fee_history_blocks, gas_amount)

def fetch_operator_fund_requirement(chain_id, rpc, fee_history_blocks: int = 20) -> int:
    if int(chain_id) == 1:
        gas_amount = 2_000_000
    else:
        gas_amount = 3_000_000
    return calculate_fund_requirement(rpc, fee_history_blocks, gas_amount)

def main() -> None:
    """Run service."""

    print_title("Optimus Quickstart")
    print("This script will assist you in setting up and running the Optimus service.")
    print()

    print_section("Set up local user account")
    operate = OperateApp(
        home=OPERATE_HOME,
    )
    operate.setup()

    optimus_config = get_local_config()
    template = get_service_template(optimus_config)
    manager = operate.service_manager()
    service = get_service(manager, template)

    if operate.user_account is None:
        print("Creating a new local user account...")
        password = ask_confirm_password()
        UserAccount.new(
            password=password,
            path=operate._path / "user.json",
        )
        optimus_config.password_migrated = True
        optimus_config.store()
    else:
        password = handle_password_migration(operate, optimus_config)
        if password is None:
            password = getpass.getpass("Enter local user account password: ")
        if not operate.user_account.is_valid(password=password):
            print("Invalid password!")
            sys.exit(1)

    operate.password = password
    if not operate.wallet_manager.exists(ledger_type=LedgerType.ETHEREUM):
        print("Creating the main wallet...")
        wallet, mnemonic = operate.wallet_manager.create(ledger_type=LedgerType.ETHEREUM)
        wallet.password = password
        print()
        print_box(f"Please save the mnemonic phrase for the main wallet:\n{', '.join(mnemonic)}", 0, '-')
        input("Press enter to continue...")
    else:
        wallet = operate.wallet_manager.load(ledger_type=LedgerType.ETHEREUM)

    manager = operate.service_manager()
    fetch_initial_funding_requirements()

    for chain_id, configuration in service.chain_configs.items():
        chain_metadata = CHAIN_ID_TO_METADATA[int(chain_id)]
        chain_name, token = chain_metadata['name'], chain_metadata["token"]
        chain_config = service.chain_configs[chain_id]
        os.environ["CUSTOM_CHAIN_RPC"] = chain_config.ledger_config.rpc
        os.environ["OPEN_AUTONOMY_SUBGRAPH_URL"] = "https://subgraph.autonolas.tech/subgraphs/name/autonolas-staging"
        os.environ["MAX_PRIORITY_FEE_PER_GAS"] = chain_metadata["gasParams"]["MAX_PRIORITY_FEE_PER_GAS"]
        os.environ["MAX_FEE_PER_GAS"] = chain_metadata["gasParams"]["MAX_FEE_PER_GAS"]

        service_exists = manager._get_on_chain_state(chain_config) != OnChainState.NON_EXISTENT

        if chain_name.lower() not in optimus_config.allowed_chains and chain_name != DEFAULT_START_CHAIN:
            # this is to ensure backward-compatibility i.e. if someone deployed the services before the user-selectable chains feature was released
            # we add those chains to allowed chains 
            if service_exists:
                optimus_config.allowed_chains.append(chain_name.lower())
            else:
                continue

        chain_type = chain_config.ledger_config.chain
        ledger_api = wallet.ledger_api(
            chain_type=chain_type,
            rpc=chain_config.ledger_config.rpc,
        )
        
        balance_str = wei_to_token(ledger_api.get_balance(wallet.crypto.address), token)
        print(
            f"[{chain_name}] Main wallet balance: {balance_str}",
        )
        safe_exists = wallet.safes.get(chain_type) is not None        

        agent_fund_requirement = fetch_agent_fund_requirement(chain_id, chain_config.ledger_config.rpc)
        if agent_fund_requirement is None:
            agent_fund_requirement = chain_config.chain_data.user_params.fund_requirements.agent

        operational_fund_req = fetch_operator_fund_requirement(chain_id, chain_config.ledger_config.rpc)
        if operational_fund_req is None:
            operational_fund_req = chain_metadata.get("operationalFundReq")

        if service_exists:
            if chain_id != 1:
                agent_balance = ledger_api.get_balance(address=service.keys[0].address)
                #we only top up if current balance is less than 50% of required balance
                if agent_balance < 0.3 * agent_fund_requirement:
                    agent_fund_requirement = agent_fund_requirement - agent_balance
                else:
                    agent_fund_requirement = 0

                operator_balance = ledger_api.get_balance(wallet.crypto.address)
                if operator_balance < 0.3 * operational_fund_req:
                    operational_fund_req = operational_fund_req - operator_balance
                else:
                    operational_fund_req = 0
            else:
                operational_fund_req = 0
                agent_fund_requirement = 0

        safety_margin = 100_000_000_000_000
        required_balance = operational_fund_req + agent_fund_requirement
        
        if not safe_exists:
            required_balance += chain_metadata["initialFundsRequirement"]

        if required_balance > 0:
            required_balance += safety_margin

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
            top_up = chain_metadata["initialFundsRequirement"] + agent_fund_requirement + safety_margin
        else:
            top_up = agent_fund_requirement + safety_margin

        if top_up > 0:
            print(
                f"[{chain_name}] Please make sure address {address} has at least {wei_to_token(top_up, token)}."
            )
            spinner = Halo(
                text=f"[{chain_name}] Waiting for funds...",
                spinner="dots",
            )
            spinner.start()

            while ledger_api.get_balance(address) < top_up:
                print(f"[{chain_name}] Funding Safe")
                wallet.transfer(
                    to=t.cast(str, wallet.safes[chain_type]),
                    amount=int(top_up),
                    chain_type=chain_type,
                    from_safe=False,
                    rpc=chain_config.ledger_config.rpc,
                )
                time.sleep(1)

            spinner.succeed(f"[{chain_name}] Safe updated balance: {wei_to_token(ledger_api.get_balance(address), token)}.")

        if chain_config.chain_data.user_params.use_staking and not service_exists:
            print(f"[{chain_name}] Please make sure address {address} has at least {wei_to_token(2 * COST_OF_BOND_STAKING, STAKED_BONDING_TOKEN)}")

            spinner = Halo(
                text=f"[{chain_name}] Waiting for {STAKED_BONDING_TOKEN}...",
                spinner="dots",
            )
            spinner.start()
            olas_address = OLAS[chain_type]
            while get_erc20_balance(ledger_api, olas_address, address) < 2 * COST_OF_BOND_STAKING:
                time.sleep(1)

            balance = get_erc20_balance(ledger_api, olas_address, address) / 10 ** 18
            spinner.succeed(f"[{chain_name}] Safe updated balance: {balance} {STAKED_BONDING_TOKEN}")

        if chain_metadata.get("usdcRequired", False) and not service_exists:
            print(f"[{chain_name}] Please make sure address {address} has at least {INITIAL_FUNDS_REQUIREMENT['USDC'] / 10 ** 6} USDC")

            spinner = Halo(
                text=f"[{chain_name}] Waiting for USDC...",
                spinner="dots",
            )
            spinner.start()

            while get_erc20_balance(ledger_api, USDC_ADDRESS, address) < INITIAL_FUNDS_REQUIREMENT['USDC']:
                time.sleep(1)

            usdc_balance = get_erc20_balance(ledger_api, USDC_ADDRESS, address) / 10 ** 6
            spinner.succeed(f"[{chain_name}] Safe updated balance: {usdc_balance} USDC.")

        manager.deploy_service_onchain_from_safe_single_chain(
            hash=service.hash,
            chain_id=chain_id,
            fallback_staking_params=FALLBACK_STAKING_PARAMS,
        )
        if chain_id == '1' and not service_exists:
            safe_fund_threshold=INITIAL_FUNDS_REQUIREMENT['ETH']
            safe_topup = safe_fund_threshold
        else:
            safe_fund_threshold = None
            safe_topup = None

        manager.fund_service(hash=service.hash, chain_id=chain_id, safe_fund_treshold=safe_fund_threshold, safe_topup=safe_topup, agent_fund_threshold=agent_fund_requirement)

        usdc_balance = get_erc20_balance(ledger_api, USDC_ADDRESS, address) if chain_metadata.get("usdcRequired", False) else 0
        if usdc_balance > 0:
            # transfer all the usdc balance into the service safe
            manager.fund_service_erc20(
                hash=service.hash,
                chain_id=chain_id,
                token=USDC_ADDRESS,
                safe_topup=usdc_balance,
                agent_topup=0,
                safe_fund_treshold=INITIAL_FUNDS_REQUIREMENT['USDC'] + usdc_balance,
            )

    safes = {
        ChainType.from_id(int(chain)).name.lower(): config.chain_data.multisig
        for chain, config in service.chain_configs.items()
    }
    home_chain_id = service.home_chain_id
    home_chain_type = ChainType.from_id(int(home_chain_id))
    target_staking_program_id = service.chain_configs[home_chain_id].chain_data.user_params.staking_program_id
    env_vars = {
        "SAFE_CONTRACT_ADDRESSES": json.dumps(safes, separators=(',', ':')),
        "TENDERLY_ACCESS_KEY": optimus_config.tenderly_access_key,
        "TENDERLY_ACCOUNT_SLUG": optimus_config.tenderly_account_slug,
        "TENDERLY_PROJECT_SLUG": optimus_config.tenderly_project_slug,
        "STAKING_TOKEN_CONTRACT_ADDRESS": STAKING[home_chain_type][target_staking_program_id],
        "COINGECKO_API_KEY": optimus_config.coingecko_api_key,
        "MIN_SWAP_AMOUNT_THRESHOLD": optimus_config.min_swap_amount_threshold,
        "ALLOWED_CHAINS": json.dumps(optimus_config.allowed_chains)
    }
    apply_env_vars(env_vars)
    print("Skipping local deployment")
    service.deployment.build(use_docker=True, force=True, chain_id=home_chain_id)
    docker_compose_path = service.path / "deployment" / "docker-compose.yaml"
    add_volumes(docker_compose_path, str(OPERATE_HOME), "/data")
    service.deployment.start(use_docker=True)

    print()
    print_section("Running the service")


if __name__ == "__main__":
    main()
