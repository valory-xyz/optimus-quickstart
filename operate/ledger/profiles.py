# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2023 Valory AG
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

"""Chain profiles."""

from operate.types import ChainType, ContractAddresses


CONTRACTS = {
    ChainType.GNOSIS: ContractAddresses(
        {
            "service_manager": "0x04b0007b2aFb398015B76e5f22993a1fddF83644",
            "service_registry": "0x9338b5153AE39BB89f50468E608eD9d764B755fD",
            "service_registry_token_utility": "0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8",
            "gnosis_safe_proxy_factory": "0x3C1fF68f5aa342D296d4DEe4Bb1cACCA912D95fE",
            "gnosis_safe_same_address_multisig": "0x6e7f594f680f7aBad18b7a63de50F0FeE47dfD06",
            "multisend": "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        }
    ),
    ChainType.OPTIMISM: ContractAddresses(
        {
            "service_manager": "0xFbBEc0C8b13B38a9aC0499694A69a10204c5E2aB",
            "service_registry": "0x3d77596beb0f130a4415df3D2D8232B3d3D31e44",
            "service_registry_token_utility": "0xBb7e1D6Cb6F243D6bdE81CE92a9f2aFF7Fbe7eac",
            "gnosis_safe_proxy_factory": "0xE43d4F4103b623B61E095E8bEA34e1bc8979e168",
            "gnosis_safe_same_address_multisig": "0xb09CcF0Dbf0C178806Aaee28956c74bd66d21f73",
            "multisend": "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        }
    ),
    ChainType.ETHEREUM: ContractAddresses(
        {
            "service_manager": "0x2EA682121f815FBcF86EA3F3CaFdd5d67F2dB143",
            "service_registry": "0x48b6af7B12C71f09e2fC8aF4855De4Ff54e775cA",
            "service_registry_token_utility": "0x3Fb926116D454b95c669B6Bf2E7c3bad8d19affA",
            "gnosis_safe_proxy_factory": "0x46C0D07F55d4F9B5Eed2Fc9680B5953e5fd7b461",
            "gnosis_safe_same_address_multisig": "0xfa517d01DaA100cB1932FA4345F68874f7E7eF46",
            "multisend": "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        }
    ),
    ChainType.BASE: ContractAddresses(
        {
            "service_manager": "0x63e66d7ad413C01A7b49C7FF4e3Bb765C4E4bd1b",
            "service_registry": "0x3C1fF68f5aa342D296d4DEe4Bb1cACCA912D95fE",
            "service_registry_token_utility": "0x34C895f302D0b5cf52ec0Edd3945321EB0f83dd5",
            "gnosis_safe_proxy_factory": "0xBb7e1D6Cb6F243D6bdE81CE92a9f2aFF7Fbe7eac",
            "gnosis_safe_same_address_multisig": "0xFbBEc0C8b13B38a9aC0499694A69a10204c5E2aB",
            "multisend": "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
        }
    ),
}

STAKING = {
    ChainType.GNOSIS: {
        "pearl_alpha": "0xEE9F19b5DF06c7E8Bfc7B28745dcf944C504198A",
        "pearl_beta": "0xeF44Fb0842DDeF59D37f85D61A1eF492bbA6135d",
    },
    ChainType.OPTIMISM: {
        "optimus_alpha": "0x88996bbdE7f982D93214881756840cE2c77C4992",
    },
    ChainType.ETHEREUM: {},
    ChainType.BASE: {},
}

OLAS = {
    ChainType.GNOSIS: "0xcE11e14225575945b8E6Dc0D4F2dD4C570f79d9f",
    ChainType.OPTIMISM: "0xFC2E6e6BCbd49ccf3A5f029c79984372DcBFE527",
    ChainType.BASE: "0x54330d28ca3357F294334BDC454a032e7f353416",
    ChainType.ETHEREUM: "0x0001A500A6B18995B03f44bb040A5fFc28E45CB0",
}
