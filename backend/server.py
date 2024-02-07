#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#   Copyright 2021-2023 Valory AG
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
"""This module implements the Olas Operate App backend endpoints."""


from controller import Controller
from flask import Flask


def create_app():
    controller = Controller()
    operate = Flask(__name__)

    # Get services
    @operate.route("/services", methods=["GET"])
    def get_services():
        return controller.get_services()

    # Get keys
    @operate.route("/keys", methods=["GET"])
    def get_mentions():
        return controller.get_keys()

    # Create keys
    @operate.route("/keys", methods=["POST"])
    def create_keys():
        return controller.create_keys()

    # Get vars
    @operate.route("/vars/<service_id>", methods=["GET"])
    def get_vars(service_id):
        return controller.get_vars(service_id)

    # Start service
    @operate.route("/start_service/<service_id>", methods=["POST"])
    def start_service(service_id):
        return controller.start_service(service_id)

    # Stop service
    @operate.route("/stop_service/<service_id>", methods=["POST"])
    def stop_service(service_id):
        return controller.stop_service(service_id)

    return operate


if __name__ == "__main__":
    operate = create_app()
    operate.run(debug=True, host="0.0.0.0")
