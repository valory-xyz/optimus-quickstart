import twikit
from typing import Optional
import json
import asyncio
from pathlib import Path
import time

EXTRACTED_COOKIES_PATH = Path("x.com.cookies.json")
SAVED_COOKIES_PATH = Path("twikit_cookies.json")

def await_for_cookies() -> dict:
    """Awaits for the cookies file"""

    print(f"Please copy the '{EXTRACTED_COOKIES_PATH}' file into this repo...")

    while not EXTRACTED_COOKIES_PATH.exists():
        time.sleep(5)

    print("Cookie file detected")

    with open(EXTRACTED_COOKIES_PATH, "r") as cookies_file:
        cookies = json.load(cookies_file)

    cookies_dict = {cookie["name"]: cookie["value"] for cookie in cookies}
    return cookies_dict


async def async_get_twitter_cookies(username, email, password) -> Optional[str]:
    """Verifies that the Twitter credentials are correct and get the cookies"""

    client = twikit.Client(
        language="en-US"
    )
    try:
        await client.login(
            auth_info_1=username,
            auth_info_2=email,
            password=password,
        )

    except twikit.errors.BadRequest:
        print("Twitter login failed due to a known issue with the login flow.\nPlease check the known issues section in the README to find the solution. You will need to provide us with a cookies file.")
        cookies = await_for_cookies()
        client.set_cookies(cookies)

    finally:
        client.save_cookies(SAVED_COOKIES_PATH)
        return json.dumps(client.get_cookies()).replace(" ", "")


def get_twitter_cookies(username, email, password) -> Optional[str]:
    """get_twitter_cookies"""
    return asyncio.run(async_get_twitter_cookies(username, email, password))