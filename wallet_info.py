import json
from pathlib import Path
from web3 import Web3
from web3.middleware import geth_poa_middleware
from decimal import Decimal
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



USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
USDC_ABI = [{"constant":True,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"}]

def load_config():
    optimus_config = get_local_config()
    service_template = get_service_template(optimus_config)
    service_hash = service_template["hash"]

    config_path = OPERATE_HOME / f"services/{service_hash}/config.json"
    with open(config_path, "r") as f:
        return json.load(f)

def get_balance(web3, address):
    balance = web3.eth.get_balance(address)
    return float(Web3.from_wei(balance, 'ether'))

def get_usdc_balance(web3, address):
    usdc_contract = web3.eth.contract(address=USDC_ADDRESS, abi=USDC_ABI)
    balance = usdc_contract.functions.balanceOf(address).call()
    return float(balance) / 1e6  # USDC has 6 decimal places

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def save_wallet_info():
    config = load_config()
    main_wallet_address = config['keys'][0]['address']
    
    main_balances = {}
    safe_balances = {}
    
    for chain_id, chain_config in config['chain_configs'].items():
        rpc_url = chain_config['ledger_config']['rpc']
        web3 = Web3(Web3.HTTPProvider(rpc_url))
        web3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        chain_name = {
            "1": "Ethereum Mainnet",
            "10": "Optimism",
            "8453": "Base"
        }.get(chain_id, f"Chain {chain_id}")
        
        # Get main wallet balance
        main_balance = get_balance(web3, main_wallet_address)
        main_balances[chain_name] = {
            "token": "ETH",
            "balance": main_balance,
            "balance_formatted": f"{main_balance:.6f} ETH"
        }
        
        # Get Safe balance
        safe_address = chain_config['chain_data']['multisig']
        safe_balance = get_balance(web3, safe_address)
        safe_balances[chain_name] = {
            "address": safe_address,
            "token": "ETH",
            "balance": safe_balance,
            "balance_formatted": f"{safe_balance:.6f} ETH"
        }
        
        # Get USDC balance for Ethereum Mainnet
        if chain_id == "1":
            usdc_balance = get_usdc_balance(web3, safe_address)
            safe_balances[chain_name]["usdc_balance"] = usdc_balance
            safe_balances[chain_name]["usdc_balance_formatted"] = f"{usdc_balance:.2f} USDC"
    
    wallet_info = {
        "main_wallet_address": main_wallet_address,
        "main_wallet_balances": main_balances,
        "safe_addresses": {chain_id: config['chain_configs'][chain_id]['chain_data']['multisig'] for chain_id in config['chain_configs']},
        "safe_balances": safe_balances,
        "chain_configs": {
            chain_id: {
                "rpc": chain_config['ledger_config']['rpc'],
                "multisig": chain_config['chain_data']['multisig'],
                "token": chain_config['chain_data']['token'],
                "fund_requirements": chain_config['chain_data']['user_params']['fund_requirements']
            }
            for chain_id, chain_config in config['chain_configs'].items()
        }
    }
    
    file_path = OPERATE_HOME / "wallets" / "wallet_info.json"
    with open(file_path, "w") as f:
        json.dump(wallet_info, f, indent=2, cls=DecimalEncoder)

if __name__ == "__main__":
    save_wallet_info()