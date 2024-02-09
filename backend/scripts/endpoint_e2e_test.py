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

BASE_URL = "http://localhost:5000"


# Get services
response = requests.get(f"{BASE_URL}/services")
print(response.status_code, response.json())

trader_hash = list(response.json().keys())[0]

# Build
response = requests.post(
    f"{BASE_URL}/services/{trader_hash}/build",
    json={"rpc": "http://localhost:8545"},
    timeout=120,
)
print(response.status_code, response.json())

# Start
response = requests.post(f"{BASE_URL}/services/{trader_hash}/start", timeout=120)
print(response.status_code, response.json())

# Stop
response = requests.post(f"{BASE_URL}/services/{trader_hash}/stop", timeout=120)
print(response.status_code, response.json())
