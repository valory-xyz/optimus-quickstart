from aea.helpers.base import IPFSHash
from aea_ledger_ethereum.ethereum import EthereumApi, EthereumCrypto
from autonomy.chain.base import registry_contracts
from autonomy.chain.config import ChainType
from protocol import OnChainManager
from service import ServiceManager
from web3 import HTTPProvider, Web3

phash = "bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe"
gnosis = {
    "service_manager": "0x04b0007b2aFb398015B76e5f22993a1fddF83644",
    "service_registry": "0x9338b5153AE39BB89f50468E608eD9d764B755fD",
    "service_registry_token_utility": "0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8",
    "gnosis_safe_proxy_factory": "0x3C1fF68f5aa342D296d4DEe4Bb1cACCA912D95fE",
    "gnosis_safe_same_address_multisig": "0x6e7f594f680f7aBad18b7a63de50F0FeE47dfD06",
    "multisend": "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
}

manager = ServiceManager()
ledger_api = EthereumApi(address="http://localhost:8545")
crypto = EthereumCrypto(".operate/master-key.txt")
agent = manager.keys.create()

print("Fetching...")
manager.fetch(phash=phash)

print("Minting...")
published = manager.mint(
    phash=phash,
    rpc="http://localhost:8545",
    agent_id=14,  # trader agent
    number_of_slots=1,
    cost_of_bond=10000000000000000,  # from script
    threshold=1,
    nft=IPFSHash(
        "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq"
    ),  # from script
    custom_addresses=gnosis,
)

print("Activating...")
manager.activate(
    phash=phash,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Registering...")
manager.register(
    phash=phash,
    instances=[agent],
    agents=[14],
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Deploying...")
info = manager.deploy(
    phash=phash,
    reuse_multisig=False,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)
print(info)

print("Terminating...")
manager.terminate(
    phash=phash,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Unbonding...")
manager.unbond(
    phash=phash,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)


service_old = manager.get(phash=phash)

print("Updating...")

# Fund agent instance
(owner,) = info["instances"]
tx = ledger_api.get_transfer_transaction(
    sender_address=crypto.address,
    destination_address=owner,
    amount=1000000000000000,
    tx_fee=50000,
    tx_nonce="0x",
    chain_id=100,
)
stx = crypto.sign_transaction(transaction=tx)
digest = ledger_api.send_signed_transaction(stx)
receipt = ledger_api.get_transaction_receipt(tx_digest=digest)

print("Swapping owner...")
manager.swap(
    phash=phash,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

phash = "bafybeigt734q4z22khysf22p5wbs4hzko3qfhwxcz3r37ahdneuc7mp5em"

print("Fetching...")
manager.fetch(phash=phash)

print("Minting...")
published = manager.mint(
    phash=phash,
    rpc="http://localhost:8545",
    agent_id=14,  # trader agent
    number_of_slots=1,
    cost_of_bond=10000000000000000,  # from script
    threshold=1,
    nft=IPFSHash(
        "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq"
    ),  # from script
    custom_addresses=gnosis,
    update_token=service_old["token"],
)

print("Activating...")
manager.activate(
    phash=phash,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Registering...")
manager.register(
    phash=phash,
    instances=[agent],
    agents=[14],
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print("Re-Deploying...")
info = manager.deploy(
    phash=phash,
    reuse_multisig=True,
    rpc="http://localhost:8545",
    custom_addresses=gnosis,
)

print(info)

print("Building...")
manager.build(
    phash=phash,
    environment={},
    volumes={"data": "/data"},
)

print("Starting...")
manager.start(phash=phash)

input("> Press enter to stop")
print("Stopping...")
manager.stop(phash=phash)
