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

"""Operate app entrypoint."""


import os
from pathlib import Path

from aea_ledger_ethereum.ethereum import EthereumCrypto
from clea import command, params, run
from operate.constants import KEY, KEYS, OPERATE, SERVICES
from operate.http import Resource
from operate.keys import Keys
from operate.services.manage import Services
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Route
from typing_extensions import Annotated
from uvicorn.main import run as uvicorn

DEFAULT_HARDHAT_KEY = (
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
).encode()


class App(Resource):
    """App resource."""

    def __init__(self, home: Path) -> None:
        """Initialize object."""
        super().__init__()
        self._path = home or (Path.cwd() / OPERATE)
        self._services = self._path / SERVICES
        self._keys = self._path / KEYS
        self._key = self._path / KEY

        self.make()

        self.keys = Keys(path=self._keys)
        self.services = Services(
            path=self._services,
            keys=self.keys,
            key=self._key,
        )

    def make(self) -> None:
        """Make the root directory."""
        self._path.mkdir(exist_ok=True)
        self._services.mkdir(exist_ok=True)
        self._keys.mkdir(exist_ok=True)
        if not self._key.exists():
            # TODO: Add support for multiple master keys
            self._key.write_bytes(
                DEFAULT_HARDHAT_KEY
                if os.environ.get("DEV", "false") == "true"
                else EthereumCrypto().private_key.encode()
            )

    @property
    def json(self) -> None:
        """Json representation of the app."""
        return {"name": "Operate HTTP server", "version": "0.1.0.rc0"}


@command(name="operate")
def _operate(
    host: Annotated[str, params.String(help="HTTP server host string")] = "localhost",
    port: Annotated[int, params.Integer(help="HTTP server port")] = 8000,
    home: Annotated[
        int, params.Directory(long_flag="--home", help="Home directory")
    ] = None,
) -> None:
    """Operate - deploy autonomous services."""
    app = App(home=home)
    uvicorn(
        app=Starlette(
            debug=True,
            routes=[
                Route("/api", app),
                Route("/api/services", app.services),
                Route("/api/services/{service}", app.services),
                Route("/api/services/{service}/{action}", app.services),
            ],
            middleware=[
                Middleware(
                    CORSMiddleware,
                    allow_origins=["*"],
                    allow_methods=("GET", "POST", "PUT", "DELETE"),
                )
            ],
        ),
        host=host,
        port=port,
    )


def main() -> None:
    """CLI entry point."""
    run(cli=_operate)


if __name__ == "__main__":
    main()
