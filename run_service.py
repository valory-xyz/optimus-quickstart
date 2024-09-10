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
from dataclasses import dataclass
from pathlib import Path

import requests
import yaml
from aea.crypto.base import LedgerApi
from aea_ledger_ethereum import EthereumApi
from dotenv import load_dotenv
from halo import Halo
from termcolor import colored

from operate.account.user import UserAccount
from operate.cli import OperateApp
from operate.ledger import Ethereum
from operate.ledger.profiles import OLAS, STAKING
from operate.resource import LocalResource, deserialize
from operate.types import (
    LedgerType,
    ServiceTemplate,
    ConfigurationTemplate,
    FundRequirementsTemplate, ChainType,
)

load_dotenv()

SUGGESTED_TOP_UP_DEFAULT = 1_000_000_000_000_000
SUGGESTED_SAFE_TOP_UP_DEFAULT = 5_000_000_000_000_000
MASTER_WALLET_MIMIMUM_BALANCE = 7_000_000_000_000_000
COST_OF_BOND = 1
COST_OF_BOND_STAKING = 2 * 10 ** 19
STAKED_BONDING_TOKEN = "OLAS"
USDC_REQUIRED = 10_000_000
USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
WARNING_ICON = colored('\u26A0', 'yellow')
OPERATE_HOME = Path.cwd() / ".optimus"

CHAIN_ID_TO_METADATA = {
    1: {
        "name": "Ethereum Mainnet",
        "token": "ETH",
        "native_token_balance": MASTER_WALLET_MIMIMUM_BALANCE,
        "usdcRequired": True,
    },
    10: {
        "name": "Optimism",
        "token": "ETH",
        "usdcRequired": False,
    },
    8453: {
        "name": "Base",
        "token": "ETH",
        "usdcRequired": False,
    },
}



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
    password_migrated: t.Optional[bool] = None
    use_staking: t.Optional[bool] = None

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
    return f"{wei_to_unit(wei):.2f} {token}"


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

    if optimus_config.password_migrated is None:
        optimus_config.password_migrated = False

    if optimus_config.use_staking is None:
        optimus_config.use_staking = input("Do you want to stake your service? (y/n): ").lower() == 'y'

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
        "hash": "bafybeifnwwfkjjz3cr7kycjnbnwmk4nryemgavamv6eruqfaegic5guc2u",
        "description": "Optimus",
        "image": "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
        "service_version": 'v0.18.1',
        "home_chain_id": "10",
        "configurations": {
            "1": ConfigurationTemplate(
                {
                    "staking_program_id": "optimus_alpha",
                    "rpc": config.ethereum_rpc,
                    "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
                    "cost_of_bond": COST_OF_BOND,
                    "threshold": 1,
                    "use_staking": False,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT,
                            "safe": SUGGESTED_SAFE_TOP_UP_DEFAULT,
                        }
                    ),
                }
            ),
            "10": ConfigurationTemplate(
                {
                    "staking_program_id": "optimus_alpha",
                    "rpc": config.optimism_rpc,
                    "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
                    "cost_of_bond": COST_OF_BOND_STAKING,
                    "threshold": 1,
                    "use_staking": config.use_staking,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT,
                            "safe": SUGGESTED_SAFE_TOP_UP_DEFAULT,
                        }
                    ),
                }
            ),
            "8453": ConfigurationTemplate(
                {
                    "staking_program_id": "optimus_alpha",
                    "rpc": config.base_rpc,
                    "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
                    "cost_of_bond": COST_OF_BOND,
                    "threshold": 1,
                    "use_staking": False,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT,
                            "safe": SUGGESTED_SAFE_TOP_UP_DEFAULT,
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
    agent_ids=[25],
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

    for chain_id, configuration in service.chain_configs.items():
        chain_metadata = CHAIN_ID_TO_METADATA[int(chain_id)]
        chain_config = service.chain_configs[chain_id]
        chain_type = chain_config.ledger_config.chain
        ledger_api = wallet.ledger_api(
            chain_type=chain_type,
            rpc=chain_config.ledger_config.rpc,
        )

        chain_name, token = chain_metadata['name'], chain_metadata["token"]
        balance_str = wei_to_token(ledger_api.get_balance(wallet.crypto.address), token)
        print(
            f"[{chain_name}] Main wallet balance: {balance_str}",
        )
        print(
            f"[{chain_name}] Please make sure main wallet {wallet.crypto.address} has at least {wei_to_token(MASTER_WALLET_MIMIMUM_BALANCE, token)}",
        )
        spinner = Halo(
            text=f"[{chain_name}] Waiting for funds...",
            spinner="dots"
        )
        spinner.start()

        while ledger_api.get_balance(wallet.crypto.address) < MASTER_WALLET_MIMIMUM_BALANCE:
            time.sleep(1)

        spinner.succeed(f"[{chain_name}] Main wallet updated balance: {wei_to_token(ledger_api.get_balance(wallet.crypto.address), token)}.")
        print()

        if wallet.safes.get(chain_type) is not None:
            print(f"[{chain_name}] Safe already exists")
        else:
            print(f"[{chain_name}] Creating Safe")
            ledger_type = LedgerType.ETHEREUM
            wallet_manager = operate.wallet_manager
            wallet = wallet_manager.load(ledger_type=ledger_type)

            wallet.create_safe(  # pylint: disable=no-member
                chain_type=chain_type,
                rpc=chain_config.ledger_config.rpc,
            )
            print(f"[{chain_name}] Funding Safe")
            wallet.transfer(
                to=t.cast(str, wallet.safes[chain_type]),
                amount=int(MASTER_WALLET_MIMIMUM_BALANCE),
                chain_type=chain_type,
                from_safe=False,
                rpc=chain_config.ledger_config.rpc,
            )

        print_section(f"[{chain_name}] Set up the service in the Olas Protocol")

        address = wallet.safes[chain_type]
        print(
            f"[{chain_name}] Please make sure address {address} has at least {wei_to_token(MASTER_WALLET_MIMIMUM_BALANCE, token)}."
        )
        spinner = Halo(
            text=f"[{chain_name}] Waiting for funds...",
            spinner="dots",
        )
        spinner.start()

        while ledger_api.get_balance(address) < MASTER_WALLET_MIMIMUM_BALANCE:
            time.sleep(1)

        spinner.succeed(f"[{chain_name}] Safe updated balance: {wei_to_token(ledger_api.get_balance(address), token)}.")

        if chain_config.chain_data.user_params.use_staking:
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


        if chain_metadata.get("usdcRequired", False):
            print(f"[{chain_name}] Please make sure address {address} has at least 10 USDC")

            spinner = Halo(
                text=f"[{chain_name}] Waiting for USDC...",
                spinner="dots",
            )
            spinner.start()

            while get_erc20_balance(ledger_api, USDC_ADDRESS, address) < USDC_REQUIRED:
                time.sleep(1)

            balance = get_erc20_balance(ledger_api, USDC_ADDRESS, address) / 10 ** 6
            spinner.succeed(f"[{chain_name}] Safe updated balance: {balance} USDC.")

        manager.deploy_service_onchain_from_safe_single_chain(
            hash=service.hash,
            chain_id=chain_id,
            fallback_staking_params=FALLBACK_STAKING_PARAMS,
        )
        manager.fund_service(hash=service.hash, chain_id=chain_id)

    safes = { chain.name.lower(): safe for chain, safe in wallet.safes.items() }
    home_chain_id = service.home_chain_id
    home_chain_type = ChainType.from_id(int(home_chain_id))
    target_staking_program_id = service.chain_configs[home_chain_id].chain_data.user_params.staking_program_id
    env_vars = {
        "SAFE_CONTRACT_ADDRESSES": json.dumps(safes, separators=(',', ':')),
        "TENDERLY_ACCESS_KEY": optimus_config.tenderly_access_key,
        "TENDERLY_ACCOUNT_SLUG": optimus_config.tenderly_account_slug,
        "TENDERLY_PROJECT_SLUG": optimus_config.tenderly_project_slug,
        "STAKING_TOKEN_CONTRACT_ADDRESS": STAKING[home_chain_type][target_staking_program_id],
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
