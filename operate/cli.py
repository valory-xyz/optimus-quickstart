# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2024 Valory AG
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

"""Operate app CLI module."""

import logging
import os
import traceback
import typing as t
from pathlib import Path

from aea.helpers.logging import setup_logger
from aea_ledger_ethereum.ethereum import EthereumCrypto
from clea import group, params, run
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing_extensions import Annotated
from uvicorn.main import run as uvicorn

from operate import services
from operate.account.user import UserAccount
from operate.constants import KEY, KEYS, OPERATE, SERVICES
from operate.ledger import get_ledger_type_from_chain_type
from operate.types import ChainType
from operate.wallet.master import MasterWallet, MasterWalletManager


DEFAULT_HARDHAT_KEY = (
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
).encode()
DEFAULT_MAX_RETRIES = 3


class OperateApp:
    """Operate app."""

    def __init__(
        self,
        home: t.Optional[Path] = None,
        logger: t.Optional[logging.Logger] = None,
    ) -> None:
        """Initialize object."""
        super().__init__()
        self._path = (home or (Path.cwd() / OPERATE)).resolve()
        self._services = self._path / SERVICES
        self._keys = self._path / KEYS
        self._master_key = self._path / KEY
        self.setup()

        self.logger = logger or setup_logger(name="operate")
        self.keys_manager = services.manage.KeysManager(
            path=self._keys,
            logger=self.logger,
        )
        self.service_manager = services.manage.ServiceManager(
            path=self._services,
            keys_manager=self.keys_manager,
            master_key_path=self._master_key,
            logger=self.logger,
        )

        self.password: t.Optional[str] = None

    @property
    def user_account(self) -> t.Optional[UserAccount]:
        """Load user account."""
        return (
            UserAccount.load(self._path / "user.json")
            if (self._path / "user.json").exists()
            else None
        )

    @property
    def master_wallet_manager(self) -> MasterWalletManager:
        """Load master wallet."""
        manager = MasterWalletManager(
            path=self._path / "wallets",
            password=self.password,
        )
        manager.setup()
        return manager

    def setup(self) -> None:
        """Make the root directory."""
        self._path.mkdir(exist_ok=True)
        self._services.mkdir(exist_ok=True)
        self._keys.mkdir(exist_ok=True)
        if not self._master_key.exists():
            # TODO: Add support for multiple master keys
            self._master_key.write_bytes(
                DEFAULT_HARDHAT_KEY
                if os.environ.get("DEV", "false") == "true"
                else EthereumCrypto().private_key.encode()
            )

    @property
    def json(self) -> dict:
        """Json representation of the app."""
        return {
            "name": "Operate HTTP server",
            "version": "0.1.0.rc0",
            "account": {
                "key": EthereumCrypto(self._master_key).address,
            },
            "home": str(self._path),
        }


def create_app(  # pylint: disable=too-many-locals, unused-argument
    home: t.Optional[Path] = None,
) -> FastAPI:
    """Create FastAPI object."""

    logger = setup_logger(name="operate")
    operate = OperateApp(home=home, logger=logger)
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["GET", "POST", "PUT", "DELETE"],
    )

    def with_retries(f: t.Callable) -> t.Callable:
        """Retries decorator."""

        async def _call(request: Request) -> t.Dict:
            """Call the endpoint."""
            logger.info(f"Calling `{f.__name__}` with retries enabled")
            retries = 0
            errors = []
            while retries < DEFAULT_MAX_RETRIES:
                try:
                    return await f(request)
                except Exception as e:  # pylint: disable=broad-except
                    errors.append(
                        {"error": str(e), "traceback": traceback.format_exc()}
                    )
                    logger.error(f"Error {e}\n{traceback.format_exc()}")
                retries += 1
            return {"errors": errors}

        return _call

    @app.get("/api")
    @with_retries
    async def _get_api(request: Request) -> t.Dict:
        """Get API info."""
        return operate.json

    @app.get("/api/account")
    @with_retries
    async def _get_account(request: Request) -> t.Dict:
        """Get account information."""
        return {"is_setup": operate.user_account is not None}

    @app.post("/api/account")
    @with_retries
    async def _setup_account(request: Request) -> t.Dict:
        """Setup account."""
        if operate.user_account is not None:
            return JSONResponse(
                content={"error": "Account already exists"},
                status_code=400,
            )

        data = await request.json()
        UserAccount.new(
            password=data["password"],
            path=operate._path / "user.json",
        )
        return JSONResponse(content={"error": None})

    @app.put("/api/account")
    @with_retries
    async def _update_password(request: Request) -> t.Dict:
        """Update password."""
        if operate.user_account is None:
            return JSONResponse(
                content={"error": "Account does not exist"},
                status_code=400,
            )

        data = await request.json()
        try:
            operate.user_account.update(
                old_password=data["old_password"],
                new_password=data["new_password"],
            )
            return JSONResponse(content={"error": None})
        except ValueError as e:
            return JSONResponse(
                content={"error": str(e), "traceback": traceback.format_exc()},
                status_code=400,
            )

    @app.post("/api/account/login")
    @with_retries
    async def _validate_password(request: Request) -> t.Dict:
        """Validate password."""
        if operate.user_account is None:
            return JSONResponse(
                content={"error": "Account does not exist"},
                status_code=400,
            )

        data = await request.json()
        if not operate.user_account.is_valid(password=data["password"]):
            return JSONResponse(
                content={"error": "Password is not valid"},
                status_code=401,
            )

        operate.password = data["password"]
        return JSONResponse(
            content={"message": "Login successful"},
            status_code=200,
        )

    @app.get("/api/wallet")
    @with_retries
    async def _get_wallets(request: Request) -> t.List[t.Dict]:
        """Get wallets."""
        wallets = []
        for wallet in operate.master_wallet_manager:
            wallets.append(wallet.json)
        return JSONResponse(content=wallets)

    @app.post("/api/wallet")
    @with_retries
    async def _create_wallet(request: Request) -> t.List[t.Dict]:
        """Create wallet"""
        if operate.user_account is None:
            return JSONResponse(
                content={"error": "Cannot create wallet; User account does not exist!"},
                status_code=400,
            )

        if operate.password is None:
            return JSONResponse(
                content={"error": "You need to login before creating a wallet"},
                status_code=401,
            )

        data = await request.json()
        chain_type = ChainType(data["chain_type"])
        ledger_type = get_ledger_type_from_chain_type(chain=chain_type)
        manager = operate.master_wallet_manager
        if manager.exists(ledger_type=ledger_type):
            return JSONResponse(
                content={
                    "wallet": manager.load(ledger_type=ledger_type).json,
                    "mnemonic": None,
                }
            )
        wallet, mnemonic = manager.create(ledger_type=ledger_type)
        return JSONResponse(content={"wallet": wallet.json, "mnemonic": mnemonic})

    @app.put("/api/wallet")
    @with_retries
    async def _create_wallet(request: Request) -> t.List[t.Dict]:
        """Create wallet safe"""
        if operate.user_account is None:
            return JSONResponse(
                content={"error": "Cannot create safe; User account does not exist!"},
                status_code=400,
            )

        if operate.password is None:
            return JSONResponse(
                content={"error": "You need to login before creating a safe"},
                status_code=401,
            )

        data = await request.json()
        chain_type = ChainType(data["chain_type"])
        ledger_type = get_ledger_type_from_chain_type(chain=chain_type)
        manager = operate.master_wallet_manager
        if not manager.exists(ledger_type=ledger_type):
            return JSONResponse(content={"error": "Wallet does not exist"})

        wallet = manager.load(ledger_type=ledger_type)
        wallet.create_safe(chain_type=chain_type, owner=data.get("owner"))
        return JSONResponse(content=wallet.json)

    @app.get("/api/services")
    @with_retries
    async def _get_services(request: Request) -> t.List[t.Dict]:
        """Get available services."""
        return JSONResponse(content=operate.service_manager.json)

    @app.post("/api/services")
    @with_retries
    async def _create_services(request: Request) -> t.Dict:
        """Create a service."""
        template = await request.json()
        service = operate.service_manager.create_or_load(
            hash=template["hash"],
            rpc=template["configuration"]["rpc"],
            on_chain_user_params=services.manage.OnChainUserParams.from_json(
                template["configuration"]
            ),
        )
        if template.get("deploy", False):
            operate.service_manager.deploy_service_onchain(hash=service.hash)
            operate.service_manager.stake_service_on_chain(hash=service.hash)
            service.deployment.build()
            service.deployment.start()
        return operate.service_manager.create_or_load(hash=service.hash).json

    @app.put("/api/services")
    @with_retries
    async def _update_services(request: Request) -> t.Dict:
        """Create a service."""
        template = await request.json()
        service = operate.service_manager.update_service(
            old_hash=template["old_service_hash"],
            new_hash=template["new_service_hash"],
        )
        if template.get("deploy", False):
            operate.service_manager.deploy_service_onchain(hash=service.hash)
            operate.service_manager.stake_service_on_chain(hash=service.hash)
            service.deployment.build()
            service.deployment.start()
        return service.json

    @app.get("/api/services/{service}")
    @with_retries
    async def _get_service(request: Request) -> t.Dict:
        """Create a service."""
        return operate.service_manager.create_or_load(
            hash=request.path_params["service"],
        ).json

    @app.post("/api/services/{service}/onchain/deploy")
    @with_retries
    async def _deploy_service_onchain(request: Request) -> t.Dict:
        """Create a service."""
        operate.service_manager.deploy_service_onchain(
            hash=request.path_params["service"]
        )
        operate.service_manager.stake_service_on_chain(
            hash=request.path_params["service"]
        )
        return operate.service_manager.create_or_load(
            hash=request.path_params["service"]
        ).json

    @app.post("/api/services/{service}/onchain/stop")
    @with_retries
    async def _stop_service_onchain(request: Request) -> t.Dict:
        """Create a service."""
        operate.service_manager.terminate_service_on_chain(
            hash=request.path_params["service"]
        )
        operate.service_manager.unbond_service_on_chain(
            hash=request.path_params["service"]
        )
        operate.service_manager.unstake_service_on_chain(
            hash=request.path_params["service"]
        )
        return operate.service_manager.create_or_load(
            hash=request.path_params["service"]
        ).json

    @app.post("/api/services/{service}/deployment/build")
    @with_retries
    async def _build_service_locally(request: Request) -> t.Dict:
        """Create a service."""
        deployment = operate.service_manager.create_or_load(
            request.path_params["service"],
        ).deployment
        deployment.build()
        return deployment.json

    @app.post("/api/services/{service}/deployment/start")
    @with_retries
    async def _start_service_locally(request: Request) -> t.Dict:
        """Create a service."""
        deployment = operate.service_manager.create_or_load(
            request.path_params["service"],
        ).deployment
        deployment.build()
        deployment.start()
        return deployment.json

    @app.post("/api/services/{service}/deployment/stop")
    @with_retries
    async def _stop_service_locally(request: Request) -> t.Dict:
        """Create a service."""
        deployment = operate.service_manager.create_or_load(
            request.path_params["service"],
        ).deployment
        deployment.stop()
        return deployment.json

    @app.post("/api/services/{service}/deployment/delete")
    @with_retries
    async def _delete_service_locally(request: Request) -> t.Dict:
        """Create a service."""
        deployment = operate.service_manager.create_or_load(
            request.path_params["service"],
        ).deployment
        deployment.delete()
        return deployment.json

    return app


@group(name="operate")
def _operate() -> None:
    """Operate - deploy autonomous services."""


@_operate.command(name="daemon")
def _daemon(
    host: Annotated[str, params.String(help="HTTP server host string")] = "localhost",
    port: Annotated[int, params.Integer(help="HTTP server port")] = 8000,
    home: Annotated[
        t.Optional[Path], params.Directory(long_flag="--home", help="Home directory")
    ] = None,
) -> None:
    """Launch operate daemon."""
    uvicorn(
        app=create_app(home=home),
        host=host,
        port=port,
    )


def main() -> None:
    """CLI entry point."""
    run(cli=_operate)


if __name__ == "__main__":
    main()
