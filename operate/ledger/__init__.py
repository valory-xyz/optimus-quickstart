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

"""Ledger helpers."""

import os
import typing as t

from operate.ledger.base import LedgerHelper
from operate.ledger.ethereum import Ethereum
from operate.ledger.solana import Solana
from operate.types import ChainType, LedgerType


MODE_RPC = os.environ.get("MODE_RPC", "https://mainnet.mode.network/")

PUBLIC_RPCS = {
    ChainType.MODE: MODE_RPC
}

DEFAULT_RPCS = {
    ChainType.MODE: MODE_RPC,
}

CHAIN_HELPERS: t.Dict[ChainType, t.Type[LedgerHelper]] = {
    ChainType.MODE: Ethereum,
}

LEDGER_HELPERS: t.Dict[LedgerType, t.Type[LedgerHelper]] = {
    LedgerType.ETHEREUM: Ethereum,
    LedgerType.SOLANA: Solana,
}

CURRENCY_DENOMS = {
    ChainType.MODE: "Wei",
}

def get_default_rpc(chain: ChainType) -> str:
    """Get default RPC chain type."""
    return DEFAULT_RPCS.get(chain, MODE_RPC)


def get_ledger_type_from_chain_type(chain: ChainType) -> LedgerType:
    """Get LedgerType from ChainType."""
    if chain in (ChainType.MODE):
        return LedgerType.ETHEREUM
    return LedgerType.SOLANA


def get_ledger_helper_by_chain(rpc: str, chain: ChainType) -> LedgerHelper:
    """Get ledger helper by chain type."""
    return CHAIN_HELPERS.get(chain, Ethereum)(rpc=rpc)


def get_ledger_helper_by_ledger(rpc: str, ledger: LedgerHelper) -> LedgerHelper:
    """Get ledger helper by ledger type."""
    return LEDGER_HELPERS.get(ledger, Ethereum)(rpc=rpc)  # type: ignore


def get_currency_denom(chain: ChainType) -> str:
    """Get currency denom by chain type."""
    return CURRENCY_DENOMS.get(chain, "Wei")
