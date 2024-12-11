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
"""Recover wallet info."""

import getpass
from pathlib import Path

from operate.cli import OperateApp
from operate.types import (
    ChainType,
    LedgerType,
)


REPO_ROOT = Path(__file__).resolve().parent
OPERATE_HOME = REPO_ROOT / ".memeooorr"


def main() -> None:
    """Main method."""

    print("")
    warning_message = (
        "WARNING: This script will display sensitive wallet information on screen, "
        "including private keys. Ensure you run this script "
        "in a secure, offline environment and do not share the output with anyone. "
        "Do you want to continue? (yes/no): "
    )
    response = input(warning_message).strip().lower()
    if response not in ("yes", "y"):
        print("Exiting the script. No information has been displayed.")
        return

    operate = OperateApp(
        home=OPERATE_HOME,
    )
    operate.setup()

    if operate.user_account is None:
        print("There is no user account created.")
        return

    password = getpass.getpass("Enter local user account password: ")
    if not operate.user_account.is_valid(password=password):
        print("Invalid password!")
        return

    operate.password = password
    manager = operate.service_manager()
    wallet = operate.wallet_manager.load(ledger_type=LedgerType.ETHEREUM)

    print("")
    print("---------------------------")
    print("Wallet recovery information")
    print("---------------------------")
    print("")
    print("Master Wallet (EOA):")
    print(f"  * Address: {wallet.crypto.address}")
    print(f"  * Private key: {wallet.crypto.private_key}")
    print("")
    print("Master Safes:")
    for operate_chain_id, safe_address in wallet.safes.items():
        print(f"  * {ChainType(operate_chain_id).name} address: {safe_address}")
    print("")

    print("Services")
    print("--------")

    for service in manager.json:
        print(f"  * Service {service['name']}:")

        print("    - Service Agents:")
        for key in service['keys']:
            print(f"      - Agent address (EOA): {key['address']}")
            print(f"        Agent private key: {key['private_key']}")

        print("")
        print("    - Service Safes:")
        for chain_id, chain_config in service['chain_configs'].items():
            print(f"      - {ChainType.from_id(int(chain_id)).name} address: {chain_config['chain_data']['multisig']}")

        print("")


if __name__ == "__main__":
    main()
