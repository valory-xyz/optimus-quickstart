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
from flask import Flask, request


def create_app():
    controller = Controller()
    operate = Flask(__name__)

    # Get services
    @operate.route("/services", methods=["GET"])
    def get_services():
        return controller.get_services()

    # Get service vars
    @operate.route("/services/<service_hash>/vars", methods=["GET"])
    def get_vars(service_hash):
        return controller.get_vars(service_hash)

    # Get service keys
    @operate.route("/services/<service_hash>/keys", methods=["GET"])
    def get_service_keys(service_hash):
        return controller.get_service_keys(service_hash)

    # Build deployment
    @operate.route("/services/<service_hash>/build", methods=["POST"])
    def build_deployment(service_hash):
        return controller.build_deployment(service_hash, request.json)

    # Delete deployment
    @operate.route("/services/<service_hash>/delete", methods=["POST"])
    def delete_deployment(service_hash):
        return controller.delete_deployment(service_hash)

    # Start service
    @operate.route("/services/<service_hash>/start", methods=["POST"])
    def start_service(service_hash):
        return controller.start_service(service_hash)

    # Stop service
    @operate.route("/services/<service_hash>/stop", methods=["POST"])
    def stop_service(service_hash):
        return controller.stop_service(service_hash)

    return operate


if __name__ == "__main__":
    operate = create_app()
    operate.run(debug=True, host="0.0.0.0", use_reloader=False)
