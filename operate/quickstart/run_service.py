from pathlib import Path
from operate.cli import OperateApp
from operate.types import (
    LedgerType,
    ServiceTemplate,
    ConfigurationTemplate,
    FundRequirementsTemplate,
    OnChainUserParams,
    OnChainFundRequirements,
)
from operate.account.user import UserAccount
import time
import sys
import getpass
import requests
import typing as t
import os
from halo import Halo
from termcolor import colored
from icecream import ic
from dotenv import load_dotenv

load_dotenv()

RPC = os.getenv('DEV_RPC')
if not RPC:
    raise ValueError("No DEV_RPC provided")

OLAS_BALANCE_REQUIRED_TO_BOND = 10_000_000_000_000_000_000
OLAS_BALANCE_REQUIRED_TO_STAKE = 10_000_000_000_000_000_000
NATIVE_BALANCE_REQUIRED_TO_BOND = 10_000_000_000_000_000
SUGGESTED_TOP_UP_DEFAULT = 50_000_000_000_000_000
SUGGESTED_SAFE_TOP_UP_DEFAULT = 500_000_000_000_000_000
MASTER_WALLET_MIMIMUM_BALANCE = 1_000_000_000_000_000_000
WARNING_ICON = colored('\u26A0', 'yellow')
OPERATE_HOME = Path.cwd() / ".operate2"
NATIVE_TOKEN_NAME = "ETH"

TEMPLATE = ServiceTemplate(
    {
        "name": "optimism_service",
        "hash": "bafybeihy3rom5x3f42ys6btjihtvkmxaqn56jg3o4e7wu3g72vwkxodcfi",
        # "hash": "bafybeibbloa4w33vj4bvdkso7pzk6tr3duvxjpecbx4mur4ix6ehnwb5uu",
        "description": "Superfest service",
        "image": "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
        "service_version": 'v0.1.0',
        "home_chain_id": "10",
        "configurations": {
            "10": ConfigurationTemplate(                     # Registry + staking configuration
                {
                    "rpc": RPC,
                    "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
                    "agent_id": 14,
                    "cost_of_bond": NATIVE_BALANCE_REQUIRED_TO_BOND,
                    "olas_cost_of_bond": OLAS_BALANCE_REQUIRED_TO_BOND,
                    "olas_required_to_stake": OLAS_BALANCE_REQUIRED_TO_STAKE,
                    "threshold": 1,
                    "use_staking": False,
                    "fund_requirements": FundRequirementsTemplate(
                        {
                            "agent": SUGGESTED_TOP_UP_DEFAULT,
                            "safe": SUGGESTED_SAFE_TOP_UP_DEFAULT,
                        }
                    ),
                }
            )
        },
    }
)


ocp1 = FundRequirementsTemplate(
    agent= 111,
    safe= 1111
)

ocp2 = FundRequirementsTemplate( {
    "agent": 222,
    "safe": 2222
}
)


ofr1 = OnChainFundRequirements(
    agent= 333,
    safe= 3333
)

# ofr2 = OnChainFundRequirements( {
#     "agent": 444,
#     "safe": 4444
# }
# )

ic(ocp2)
ic(ocp1)
ic(ofr1)
# ic(ofr2)


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


def wei_to_token(wei: int, token: str = NATIVE_TOKEN_NAME) -> str:
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



def main() -> None:
    """Run service."""

    print_title("Superfest Quickstart")
    print("This script will assist you in setting up and running the Superfest service.")
    print()

    print_section("Set up local user account")
    operate = OperateApp(
        home=OPERATE_HOME,
    )
    operate.setup()

    if operate.user_account is None:
        print("Creating a new local user account...")
        password = ask_confirm_password()
        UserAccount.new(
            password=password,
            path=operate._path / "user.json",
        )
    else:
        password="foo"
        #password = getpass.getpass("Enter local user account password: ")
        if not operate.user_account.is_valid(password=password):
            print("Invalid password!")
            sys.exit(1)

    operate.password = password
    if not operate.wallet_manager.exists(ledger_type=LedgerType.ETHEREUM):
        print("Creating the main wallet...")
        wallet, mnemonic = operate.wallet_manager.create(ledger_type=LedgerType.ETHEREUM)
        wallet.password = password
        print()
        print_box(f"Please save the mnemonic phrase for the main wallet:\n{', '.join(mnemonic)}", 0 , '-')
        input("Press enter to continue...")
    else:
        wallet = operate.wallet_manager.load(ledger_type=LedgerType.ETHEREUM)

    manager = operate.service_manager()

    service_path = operate._services / TEMPLATE["hash"]
    # if not service_path.exists():
    #     rpc_url = getpass.getpass("Please enter your RPC: ")
    #     check_rpc(rpc_url=rpc_url)

    service = manager.load_or_create(
        hash=TEMPLATE["hash"],
        service_template=TEMPLATE,
    )

    home_chain_config = service.chain_configs[service.home_chain_id]
    home_ledger_api = wallet.ledger_api(
        chain_type=home_chain_config.ledger_config.chain,
        rpc=home_chain_config.ledger_config.rpc,
    )

    print(f"Main wallet balance: {wei_to_token(home_ledger_api.get_balance(wallet.crypto.address))}")
    spinner = Halo(text=f"Please make sure main wallet {wallet.crypto.address} has at least {wei_to_token(MASTER_WALLET_MIMIMUM_BALANCE)}.", spinner="dots")
    spinner.start()

    while home_ledger_api.get_balance(wallet.crypto.address) < MASTER_WALLET_MIMIMUM_BALANCE:
        time.sleep(1)

    spinner.succeed(f"Main wallet updated balance: {wei_to_token(home_ledger_api.get_balance(wallet.crypto.address))}.")
    print()

    if wallet.safe is not None:
        print("Safe already exists")
    else:
        print("Creating Safe")
        chain_type = home_chain_config.ledger_config.chain
        ledger_type = LedgerType.ETHEREUM
        wallet_manager = operate.wallet_manager
        wallet = wallet_manager.load(ledger_type=ledger_type)

        import pdb;pdb.set_trace()

        wallet.create_safe(  # pylint: disable=no-member
            chain_type=chain_type,
            rpc="https://virtual.gnosis.rpc.tenderly.co/a929dfd1-7b52-43b3-a158-fb2865e97af2",
        )
        print("Funding Safe")
        wallet.transfer(
            to=t.cast(str, wallet.safe),
            amount=int(1e18),
            chain_type=home_chain_config.ledger_config.chain,
            from_safe=False,
        )

    print_section("Set up the service in the Olas Protocol")


    address = wallet.safe
    print(f"Safe balance: {wei_to_token(home_ledger_api.get_balance(address))}")
    spinner = Halo(text=f"Please make sure address {address} has at least {wei_to_token(MASTER_WALLET_MIMIMUM_BALANCE)}.", spinner="dots")
    spinner.start()

    while home_ledger_api.get_balance(address) < MASTER_WALLET_MIMIMUM_BALANCE:
        time.sleep(1)

    spinner.succeed(f"Safe updated balance: {wei_to_token(home_ledger_api.get_balance(address))}.")
    print()





    manager.deploy_service_onchain_from_safe(hash=service.hash)


    #manager.stake_service_on_chain(hash=service.hash)
    #manager.fund_service(hash=service.hash)

    print()
    print_section("Run the service")

#    manager.deploy_service_locally(hash=service.hash)


if __name__ == "__main__":
    main()




