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
    "hash": "bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe",
    "repository": "valory-xyz/trader",
    "image": "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
    "number_of_agents": 1,
    "ledger": {
        "type": "ethereum",
        "chain": "gnosis",
        "rpc": "http://localhost:8545",
    },
    "deployments": {
        "chain": {
            "required_funds": 0.1,
            "agent_id": 14,
            "cost_of_bond": 10000000000000000,
            "threshold": 1,
            "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
        },
        "local": {
            "volumes": {"data": "/data"},
            "variables": [
                {
                    "key": "MECH_AGENT_ADDRESS",
                    "value": "0x77af31De935740567Cf4fF1986D04B2c964A786a",
                },
                {
                    "key": "WXDAI_ADDRESS",
                    "value": "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
                },
                {"key": "CHAIN_ID", "value": 100},
                {
                    "key": "ON_CHAIN_SERVICE_ID",
                    "value": "${service.chain_data.token}",  # allows for runtime variable substituion
                },
                {
                    "key": "ALL_PARTICIPANTS",
                    "value": "${service.chain_data.instances}",  # allows for runtime variable substituion
                },
                {
                    "key": "OMEN_CREATORS",
                    "value": ["0x89c5cc945dd550BcFfb72Fe42BfF002429F46Fec"],
                },
                {"key": "BET_THRESHOLD", "value": 5000000000000000},
                {"key": "TRADING_STRATEGY", "value": "kelly_criterion"},
                {
                    "key": "PROMPT_TEMPLATE",
                    "value": 'Please take over the role of a Data Scientist to evaluate the given question. With the given question "@{question}" and the \`yes\` option represented by \`@{yes}\` and the \`no\` option represented by \`@{no}\`, what are the respective probabilities of \`p_yes\` and \`p_no\` occurring?',
                },
                {
                    "key": "IRRELEVANT_TOOLS",
                    "value": [
                        "openai-gpt-3.5-turbo-instruct",
                        "prediction-online-summarized-info",
                        "prediction-online-sum-url-content",
                        "prediction-online",
                        "openai-text-davinci-002",
                        "openai-text-davinci-003",
                        "openai-gpt-3.5-turbo",
                        "openai-gpt-4",
                        "stabilityai-stable-diffusion-v1-5",
                        "stabilityai-stable-diffusion-xl-beta-v2-2-2",
                        "stabilityai-stable-diffusion-512-v2-1",
                        "stabilityai-stable-diffusion-768-v2-1",
                        "deepmind-optimization-strong",
                        "deepmind-optimization",
                        "claude-prediction-offline",
                        "prediction-offline",
                        "prediction-offline-sme",
                    ],
                },
            ],
        },
    },
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
            url=f"{BASE_URL}/services/bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe/deploy/",
        ).content.decode()
    )

    input("> Press enter to stop")
    print(
        requests.get(
            url=f"{BASE_URL}/services/bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe/stop/",
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
        "bafybeihn5f3w6n5j72imfdxrjwdxbzszqxgylhk6a4i6fm5wkotp4bldzu"
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
