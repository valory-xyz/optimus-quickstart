`GET /api`

Returns information of the operate daemon

<details>
  <summary>Response</summary>

```json
{
  "name": "Operate HTTP server",
  "version": "0.1.0.rc0",
  "account": {
    "key": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb9226a"
  },
  "home": "/Users/virajpatel/valory/olas-operate-app/.operate"
}
```

</details>

---
`GET /api/services`

Returns the list of services

<details>
  <summary>Response</summary>

```json
[
  {
    "hash": "bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a",
    "keys": [
      {
        "ledger": 0,
        "address": "0x6Db941e0e82feA3c02Ba83B20e3fB5Ea6ee539cf",
        "private_key": "0x34f58dcc11acec007644e49921fd81b9c8a959f651d6d66a42242a1b2dbaf4be"
      }
    ],
    "ledger_config": {
      "rpc": "http://localhost:8545",
      "type": 0,
      "chain": 2
    },
    "chain_data": {
      "instances": [
        "0x6Db941e0e82feA3c02Ba83B20e3fB5Ea6ee539cf"
      ],
      "token": 380,
      "multisig": "0x7F3e460Cf596E783ca490791643C0055Fa2034AC",
      "staked": false,
      "on_chain_state": 6,
      "user_params": {
        "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
        "agent_id": 14,
        "threshold": 1,
        "use_staking": false,
        "cost_of_bond": 10000000000000000,
        "olas_cost_of_bond": 10000000000000000000,
        "olas_required_to_stake": 10000000000000000000,
        "fund_requirements": {
          "agent": 0.1,
          "safe": 0.5
        }
      }
    },
    "path": "/Users/virajpatel/valory/olas-operate-app/.operate/services/bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a",
    "service_path": "/Users/virajpatel/valory/olas-operate-app/.operate/services/bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a/trader_omen_gnosis",
    "name": "valory/trader_omen_gnosis"
  }
]
```

</details>

---
`POST /api/services`

Create a service using the service template

<details>
  <summary>Request</summary>

```json
{
  "name": "Trader Agent",
  "description": "Trader agent for omen prediction markets",
  "hash": "bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a",
  "image": "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
  "configuration": {
    "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
    "rpc": "http://localhost:8545",
    "agent_id": 14,
    "threshold": 1,
    "use_staking": false,
    "cost_of_bond": 10000000000000000,
    "olas_cost_of_bond": 10000000000000000000,
    "olas_required_to_stake": 10000000000000000000,
    "fund_requirements": {
      "agent": 0.1,
      "safe": 0.5
    }
  }
}
```

</details>

Optionally you can add `deploy` parameter and set it to `true` for a full deployment in a single request.

<details>
  <summary>Response</summary>

```json
{
  "hash": "bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a",
  "keys": [
    {
      "ledger": 0,
      "address": "0x10EB940024913dfCAE95D21E04Ba662cdfB79fF0",
      "private_key": "0x00000000000000000000000000000000000000000000000000000000000000000"
    }
  ],
  "ledger_config": {
    "rpc": "http: //localhost:8545",
    "type": 0,
    "chain": 2
  },
  "chain_data": {
    "instances": [
      "0x10EB940024913dfCAE95D21E04Ba662cdfB79fF0"
    ],
    "token": 382,
    "multisig": "0xf21d8A424e83BBa2588306D1C574FE695AD410b5",
    "staked": false,
    "on_chain_state": 4,
    "user_params": {
      "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
      "agent_id": 14,
      "threshold": 1,
      "use_staking": false,
      "cost_of_bond": 10000000000000000,
      "olas_cost_of_bond": 10000000000000000000,
      "olas_required_to_stake": 10000000000000000000,
      "fund_requirements": {
        "agent": 0.1,
        "safe": 0.5
      }
    }
  },
  "path": "~/.operate/services/bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a",
  "service_path": "~/.operate/services/bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a/trader_omen_gnosis",
  "name": "valory/trader_omen_gnosis"
}
```

</details>

---
`PUT /api/services`

Update a service


<details>
  <summary>Request</summary>

```json
{
    "old_service_hash": "bafybeieagxzdbmea3nttlve3yxjne5z7tt7mp26tfpgepm7p2ezovtdx4a",
    "new_service_hash": "bafybeicxdpkuk5z5zfbkso7v5pywf4v7chxvluyht7dtgalg6dnhl7ejoe",
}
```

</details>

Optionally you can add `deploy` parameter and set it to `true` for a full deployment in a single request.

<details>
  <summary>Response</summary>

```json
{
  "hash": "bafybeicxdpkuk5z5zfbkso7v5pywf4v7chxvluyht7dtgalg6dnhl7ejoe",
  "keys": [
    {
      "ledger": 0,
      "address": "0x10EB940024913dfCAE95D21E04Ba662cdfB79fF0",
      "private_key": "0x00000000000000000000000000000000000000000000000000000000000000000"
    }
  ],
  "ledger_config": {
    "rpc": "http: //localhost:8545",
    "type": 0,
    "chain": 2
  },
  "chain_data": {
    "instances": [
      "0x10EB940024913dfCAE95D21E04Ba662cdfB79fF0"
    ],
    "token": 382,
    "multisig": "0xf21d8A424e83BBa2588306D1C574FE695AD410b5",
    "staked": false,
    "on_chain_state": 4,
    "user_params": {
      "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
      "agent_id": 14,
      "threshold": 1,
      "use_staking": false,
      "cost_of_bond": 10000000000000000,
      "olas_cost_of_bond": 10000000000000000000,
      "olas_required_to_stake": 10000000000000000000,
      "fund_requirements": {
        "agent": 0.1,
        "safe": 0.5
      }
    }
  },
  "path": "~/.operate/services/bafybeicxdpkuk5z5zfbkso7v5pywf4v7chxvluyht7dtgalg6dnhl7ejoe",
  "service_path": "~/.operate/services/bafybeicxdpkuk5z5zfbkso7v5pywf4v7chxvluyht7dtgalg6dnhl7ejoe/trader_omen_gnosis",
  "name": "valory/trader_omen_gnosis"
}
```

</details>

---
`GET /api/services/{service}`

<details>
  <summary>Response</summary>

```json
{
  "hash": "{service}",
  "keys": [
    {
      "ledger": 0,
      "address": "0x10EB940024913dfCAE95D21E04Ba662cdfB79fF0",
      "private_key": "0x00000000000000000000000000000000000000000000000000000000000000000"
    }
  ],
  "ledger_config": {
    "rpc": "http: //localhost:8545",
    "type": 0,
    "chain": 2
  },
  "chain_data": {
    "instances": [
      "0x10EB940024913dfCAE95D21E04Ba662cdfB79fF0"
    ],
    "token": 382,
    "multisig": "0xf21d8A424e83BBa2588306D1C574FE695AD410b5",
    "staked": false,
    "on_chain_state": 4,
    "user_params": {
      "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq",
      "agent_id": 14,
      "threshold": 1,
      "use_staking": false,
      "cost_of_bond": 10000000000000000,
      "olas_cost_of_bond": 10000000000000000000,
      "olas_required_to_stake": 10000000000000000000,
      "fund_requirements": {
        "agent": 0.1,
        "safe": 0.5
      }
    }
  },
  "path": "~/.operate/services/{service}",
  "service_path": "~/.operate/services/{service}/trader_omen_gnosis",
  "name": "valory/trader_omen_gnosis"
}
```

</details>

---
`GET /api/services/{service}/deployment`

<details>
  <summary>Response</summary>

```json
{
  "status": 1,
  "nodes": {
    "agent": [
      "traderomengnosis_abci_0"
    ],
    "tendermint": [
      "traderomengnosis_tm_0"
    ]
  }
}
```

</details>

---
`POST /api/services/{service}/onchain/deploy`

Deploy service on-chain

<details>
  <summary>Request</summary>

```json
```

</details>

<details>
  <summary>Response</summary>

```json
```

</details>

---
`POST /api/services/{service}/onchain/stop`

Stop service on-chain

<details>
  <summary>Request</summary>

```json
```

</details>

<details>
  <summary>Response</summary>

```json
```

</details>

---
`POST /api/services/{service}/deployment/build`

Build service locally

<details>
  <summary>Request</summary>

```json
```

</details>

<details>
  <summary>Response</summary>

```json
```

</details>

---
`POST /api/services/{service}/deployment/start`

Start agent

<details>
  <summary>Request</summary>

```json
```

</details>

<details>
  <summary>Response</summary>

```json
```

</details>

---
`POST /api/services/{service}/deployment/stop`

Stop agent

```json
```

---
`POST /api/services/{service}/deployment/delete`

Delete local deployment

<details>
  <summary>Request</summary>

```json
```

</details>

<details>
  <summary>Response</summary>

```json
```

</details>

<!-- <details>
  <summary>Request</summary>

```json
```

</details>

<details>
  <summary>Response</summary>

```json
```

---
</details`-->
