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
import sys
import time
import typing as t
from dataclasses import dataclass
from pathlib import Path

import requests
from dotenv import load_dotenv
from halo import Halo
from termcolor import colored

from operate.account.user import UserAccount
from operate.cli import OperateApp
from operate.resource import LocalResource
from operate.types import (
    LedgerType,
    ServiceTemplate,
    ConfigurationTemplate,
    FundRequirementsTemplate,
)

load_dotenv()

XDAI_BALANCE_REQUIRED_TO_BOND = 10_000_000_000_000_000
SUGGESTED_TOP_UP_DEFAULT = 50_000_000_000_000_000
SUGGESTED_SAFE_TOP_UP_DEFAULT = 500_000_000_000_000_000
MASTER_WALLET_MIMIMUM_BALANCE = 1_000_000_000_000_000_000
COST_OF_BOND = 20_000_000_000_000_000
WARNING_ICON = colored('\u26A0', 'yellow')
OPERATE_HOME = Path.cwd() / ".optimus"


@dataclass
class OptimusConfig(LocalResource):
    """Local configuration."""

    tenderly_api_key: t.Optional[str] = None
    optimism_rpc: t.Optional[str] = None
    ethereum_rpc: t.Optional[str] = None
    base_rpc: t.Optional[str] = None


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
        optimus_config = OptimusConfig()

    print_section("API Key Configuration")

    if optimus_config.ethereum_rpc is None:
        optimus_config.ethereum_rpc = input("Please enter an Ethereum RPC URL: ")

    if optimus_config.optimism_rpc is None:
        optimus_config.optimism_rpc = input("Please enter an Optimism RPC URL: ")

    if optimus_config.base_rpc is None:
        optimus_config.base_rpc = input("Please enter a Base RPC URL: ")

    if optimus_config.tenderly_api_key is None:
        optimus_config.tenderly_api_key = input(
            "Please enter your Tenderly API Key. Get one at https://dashboard.tenderly.co/: "
        )

    return optimus_config


def get_service_template(config: OptimusConfig) -> ServiceTemplate:
    """Get the service template"""
    return ServiceTemplate({
        "name": "Optimus",
        "hash": "bafybeihjiabgn2wzlrnwdij7lbg6tqvhe62mdycefdmsy2udiyxqtc3rsy",
        "description": "Optimus",
        "image": "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
        "service_version": 'v0.18.1',
        "home_chain_id": "10",
        "configurations": {
            "1": ConfigurationTemplate(
                {
                    "staking_program_id": "pearl_alpha",
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
                    "staking_program_id": "pearl_alpha",
                    "rpc": config.optimism_rpc,
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
            "8453": ConfigurationTemplate(
                {
                    "staking_program_id": "pearl_alpha",
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
        password = "12345"
        UserAccount.new(
            password=password,
            path=operate._path / "user.json",
        )
    else:
        password = "12345"
        # password = getpass.getpass("Enter local user account password: ")
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
    service = manager.load_or_create(
        hash=template["hash"],
        service_template=template,
    )

    for chain_id, configuration in service.chain_configs.items():
        chain_config = service.chain_configs[chain_id]
        chain_type = chain_config.ledger_config.chain
        ledger_api = wallet.ledger_api(
            chain_type=chain_type,
            rpc=chain_config.ledger_config.rpc,
        )

        print(f"[Chain {chain_id}] Main wallet balance: {wei_to_token(ledger_api.get_balance(wallet.crypto.address))}")
        spinner = Halo(
            text=f"Please make sure main wallet {wallet.crypto.address} has at least {wei_to_token(MASTER_WALLET_MIMIMUM_BALANCE)}.",
            spinner="dots"
        )
        spinner.start()

        while ledger_api.get_balance(wallet.crypto.address) < MASTER_WALLET_MIMIMUM_BALANCE:
            time.sleep(1)

        spinner.succeed(f"Main wallet updated balance: {wei_to_token(ledger_api.get_balance(wallet.crypto.address))}.")
        print()

        if wallet.safes.get(chain_type) is not None:
            print("Safe already exists")
        else:
            print("Creating Safe")
            ledger_type = LedgerType.ETHEREUM
            wallet_manager = operate.wallet_manager
            wallet = wallet_manager.load(ledger_type=ledger_type)

            wallet.create_safe(  # pylint: disable=no-member
                chain_type=chain_type,
                rpc=chain_config.ledger_config.rpc,
            )
            print("Funding Safe")
            wallet.transfer(
                to=t.cast(str, wallet.safes[chain_type]),
                amount=int(MASTER_WALLET_MIMIMUM_BALANCE),
                chain_type=chain_type,
                from_safe=False,
                rpc=chain_config.ledger_config.rpc,
            )

        print_section("Set up the service in the Olas Protocol")

        address = wallet.safes[chain_type]
        print(f"Safe balance: {wei_to_token(ledger_api.get_balance(address))}")
        spinner = Halo(
            text=f"Please make sure address {address} has at least {wei_to_token(MASTER_WALLET_MIMIMUM_BALANCE)}.",
            spinner="dots",
        )
        spinner.start()

        while ledger_api.get_balance(address) < MASTER_WALLET_MIMIMUM_BALANCE:
            time.sleep(1)

        spinner.succeed(f"Safe updated balance: {wei_to_token(ledger_api.get_balance(address))}.")

        manager.deploy_service_onchain_from_safe_single_chain(hash=service.hash, chain_id=chain_id)
        manager.fund_service(hash=service.hash, chain_id=chain_id)

    home_chain_id = service.home_chain_id
    manager.deploy_service_locally(hash=service.hash, chain_id=chain_id, use_docker=True)

    print()
    print_section("Run the service")


if __name__ == "__main__":
    main()
