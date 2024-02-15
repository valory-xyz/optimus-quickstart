#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2021-2024 Valory AG
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
"""This module contains e2e tests."""

import requests
from aea_ledger_ethereum.ethereum import EthereumApi, EthereumCrypto

TRADER_TEMPLATE = {
    "name": "Trader Agent",
    "description": "Trader agent for omen prediction markets",
    "hash": "bafybeigiwlvm6ey4dmlztg3z4xyvpol23n444vliivx2ybuki7xo4f3pae",
    "image": "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
    "rpc": "http://localhost:8545",  # User provided
}

BASE_URL = "http://localhost:8000/api"


def test_endpoint_e2e():
    print("Creating service using template")
    response = requests.post(
        url=f"{BASE_URL}/services",
        json=TRADER_TEMPLATE,
    ).json()
    print(response)

    input("> Press enter to start")
    print(
        requests.get(
            url=f"{BASE_URL}/services/bafybeigiwlvm6ey4dmlztg3z4xyvpol23n444vliivx2ybuki7xo4f3pae/deploy/",
        ).content.decode()
    )

    input("> Press enter to stop")
    print(
        requests.get(
            url=f"{BASE_URL}/services/bafybeigiwlvm6ey4dmlztg3z4xyvpol23n444vliivx2ybuki7xo4f3pae/stop/",
        ).content.decode()
    )

    input("> Press enter to update")
    # Fund agent instance for swapping
    ledger_api = EthereumApi(address="http://localhost:8545")
    crypto = EthereumCrypto(".operate/key")
    (owner,) = response["chain_data"]["instances"]
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
    ledger_api.get_transaction_receipt(tx_digest=digest)

    old = TRADER_TEMPLATE["hash"]
    TRADER_TEMPLATE["hash"] = (
        "bafybeicxdpkuk5z5zfbkso7v5pywf4v7chxvluyht7dtgalg6dnhl7ejoe"
    )
    print(
        requests.put(
            url=f"{BASE_URL}/services",
            json={
                "old": old,
                "new": TRADER_TEMPLATE,
            },
        ).content.decode()
    )


if __name__ == "__main__":
    test_endpoint_e2e()
