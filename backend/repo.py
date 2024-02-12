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
"""This module implements the repo class."""

import requests
import typing as t
import re

GH_API_BASE = "https://api.github.com/repos"
GH_RAW_BASE = "https://raw.githubusercontent.com"

class Repo:
    """Repo class"""

    def __init__(self, repo_str) -> None:
        """Init"""
        self.gh_account, self.name = repo_str.split("/")

    def get_tags(self) -> t.List[str]:
        """Get the repo tags"""
        url = f"{GH_API_BASE}/{self.gh_account}/{self.name}/tags"
        response = requests.get(url)
        return [tag["name"] for tag in response.json()]

    def get_latest_tag(self) -> t.Optional[str]:
        """Get the latest tag"""
        tags = self.get_tags()
        return tags[0] if tags else None

    def get_service_hash(self, version: t.Optional[str] = None) -> t.Optional[str]:
        """Get the service hash for a given version"""
        if not version:
            version = self.get_latest_tag()
        url = f"{GH_RAW_BASE}/{self.gh_account}/{self.name}/{version}/packages/packages.json"
        response = requests.get(url)
        service_regex = rf"service\/.*\/{self.name}/"
        services = {k: v for k, v in response.json()["dev"].items() if re.match(service_regex, k)}
        return services[list(services.keys())[0]] if services else None
