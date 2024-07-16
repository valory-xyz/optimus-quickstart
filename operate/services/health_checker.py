import asyncio
import time
import traceback
import typing as t

import aiohttp
from aea.helpers.logging import setup_logger

from operate.services.manage import ServiceManager  # type: ignore


HTTP_OK = 200


class HealthChecker:
    SLEEP_PERIOD = 30
    PORT_UP_TIMEOUT = 120  # seconds

    def __init__(self, service_manager: ServiceManager):
        self._jobs: t.Dict[str, asyncio.Task] = {}
        self.logger = setup_logger(name="operate.health_checker")
        self.logger.info("[HEALTCHECKER]: created")
        self._service_manager = service_manager

    def start_for_service(self, service: str):
        self.logger.info(f"[HEALTCHECKER]: Starting healthcheck job for {service}")
        if service in self._jobs:
            self.stop_for_service(service=service)

        loop = asyncio.get_running_loop()
        self._jobs[service] = loop.create_task(
            self.healthcheck_job(
                hash=service,
            )
        )

    def stop_for_service(self, service: str):
        if service not in self._jobs:
            return
        self.logger.info(
            f"[HEALTCHECKER]: Cancelling existing healthcheck_jobs job for {service}"
        )
        status = self._jobs[service].cancel()
        if not status:
            self.logger.info(
                f"[HEALTCHECKER]: Healthcheck job cancellation for {service} failed"
            )

    async def check_service_health(self, service: str) -> bool:
        """Check the service health"""
        del service
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8716/healthcheck") as resp:
                status = resp.status
                response_json = await resp.json()
                # self.logger.info(f"[HEALTCHECKER]: check {status}, {response_json}")
                return status == HTTP_OK and response_json.get(
                    "is_transitioning_fast", False
                )

    async def healthcheck_job(
        self,
        hash: str,
    ) -> None:
        """Start a background funding job."""

        try:
            service = hash

            self.logger.info(
                f"[HEALTCHECKER] Start healthcheck job for service: {service}"
            )

            async def _wait_for_port(sleep_period=15):
                self.logger.info("[HEALTCHECKER]: wait port is up")
                while True:
                    try:
                        await self.check_service_health(service)
                        self.logger.info("[HEALTCHECKER]: port is UP")
                        return
                    except aiohttp.ClientConnectionError:
                        self.logger.error("[HEALTCHECKER]: error connecting http port")
                    await asyncio.sleep(sleep_period)

            async def _check_port_ready(timeout=self.PORT_UP_TIMEOUT, sleep_period=15):
                try:
                    await asyncio.wait_for(
                        _wait_for_port(sleep_period=sleep_period), timeout=timeout
                    )
                    return True
                except asyncio.TimeoutError:
                    return False

            async def _check_health(number_of_fails=5, sleep_period=self.SLEEP_PERIOD):
                fails = 0
                while True:
                    try:
                        # Check the service health
                        healthy = await self.check_service_health(service)
                    except aiohttp.ClientConnectionError:
                        self.logger.info("[HEALTCHECKER] port read failed. restart")
                        return
                    self.logger.info(f"[HEALTCHECKER] is HEALTHY")

                    if not healthy:
                        fails += 1
                        self.logger.info(
                            f"[HEALTCHECKER] not healthy for {fails} time in a row"
                        )
                    else:
                        # reset fails if comes healty
                        fails = 0

                    if fails >= number_of_fails:
                        # too much fails, exit
                        self.logger.error(
                            f"[HEALTCHECKER] failed {fails} times in a row. restart"
                        )
                        return
                    await asyncio.sleep(sleep_period)

            async def _restart(service_manager, service):
                service_manager.stop_service_locally(hash=service)
                service_manager.deploy_service_locally(hash=service)

            # upper cycle
            while True:
                self.logger.info("[HEALTCHECKER] wait for port ready")
                if not (await _check_port_ready(timeout=self.PORT_UP_TIMEOUT)):
                    self.logger.info(
                        "[HEALTCHECKER] port not ready within timeout. restart deploymen"
                    )
                else:
                    # blocking till restart needed
                    self.logger.info(
                        f"[HEALTCHECKER] port is ready, checking health every {self.SLEEP_PERIOD}"
                    )
                    await _check_health(sleep_period=self.SLEEP_PERIOD)

                # perform restart
                # TODO: blocking!!!!!!!
                await _restart(self._service_manager, service)
        except Exception as e:
            self.logger.exception("oops")
