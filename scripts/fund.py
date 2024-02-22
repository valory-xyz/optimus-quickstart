"""Fund an address on gnosis fork."""

import sys

from aea_ledger_ethereum.ethereum import EthereumApi, EthereumCrypto

address = sys.argv[1]
ledger_api = EthereumApi(address="http://localhost:8545")
crypto = EthereumCrypto("scripts/keys/gnosis.txt")
tx = ledger_api.get_transfer_transaction(
    sender_address=crypto.address,
    destination_address=address,
    amount=10000000000000000000,
    tx_fee=50000,
    tx_nonce="0x",
    chain_id=100,
)
stx = crypto.sign_transaction(transaction=tx)
digest = ledger_api.send_signed_transaction(stx)
ledger_api.get_transaction_receipt(tx_digest=digest, raise_on_try=True)

print(ledger_api.get_balance(address=address))
