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

"""Keys manager."""
import json
import os
import typing as t
from pathlib import Path

from aea_ledger_ethereum.ethereum import EthereumCrypto

from operate.types import KeyType


class Keys:
    """Keys manager."""

    def __init__(self, path: Path) -> None:
        """Initialize object."""
        self._path = path

    def get(self, key: str) -> KeyType:
        """Get key object."""
        return json.loads((self._path / key).read_text(encoding="utf-8"))

    def create(self) -> str:
        """Creates new key."""
        crypto = EthereumCrypto()
        path = self._path / crypto.address
        if path.is_file():
            return crypto.address

        path.write_text(
            json.dumps(
                {
                    "address": crypto.address,
                    "private_key": crypto.private_key,
                    "ledger": "ethereum",
                },
                indent=4,
            ),
            encoding="utf-8",
        )
        return crypto.address

    def delete(self, key: str) -> None:
        """Delete key."""
        os.remove(self._path / key)
