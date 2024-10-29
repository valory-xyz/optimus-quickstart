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
"""Memeooorr Quickstart script."""

import sys
import shutil
from operate.cli import OperateApp
from run_service import (
    print_title, OPERATE_HOME, get_local_config, get_service_template, print_section, get_service,
)
from pathlib import Path


def main() -> None:
    """Run service."""

    print_title("Stop Memeooorr Quickstart")

    operate = OperateApp(
        home=OPERATE_HOME,
    )
    operate.setup()

    # Check if Memeooorr was started before
    path = OPERATE_HOME / "local_config.json"
    if not path.exists():
        print("Nothing to clean. Exiting.")
        sys.exit(0)

    memeooorr_config = get_local_config()
    template = get_service_template(memeooorr_config)
    manager = operate.service_manager()
    service = get_service(manager, template)

    # Backup the database and cookies if they exist
    database_source = service.path / "deployment" / "persistent_data" / "logs" / "memeooorr.db"
    database_target = Path.cwd() / "memeooorr.db"
    if database_source.is_file():
        print("Created a backup of the db")
        shutil.copy(database_source, database_target)

    cookies_source = service.path / "deployment" / "persistent_data" / "logs" / "twikit_cookies.json"
    cookies_target = Path.cwd() / "twikit_cookies.json"
    if cookies_source.is_file():
        print("Created a backup of the cookies")
        shutil.copy(cookies_source, cookies_target)

    manager.stop_service_locally(hash=service.hash, delete=True)
    print()
    print_section("Service stopped")


if __name__ == "__main__":
    main()
