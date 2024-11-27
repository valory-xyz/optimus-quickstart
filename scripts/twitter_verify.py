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


async def async_validate_twitter_credentials():
    """Test twitter credential validity"""

    # Load cookies
    with open(Path(".memeooorr", "local_config.json"), "r", encoding="utf-8") as config_file:
        config = json.load(config_file)
        cookies = json.loads(config["twikit_cookies"])

    # Instantiate the client
    client = twikit.Client(
        language="en-US"
    )

    # Set cookies
    client.set_cookies(cookies)

    # Try to read using cookies
    try:
        tweet = await client.get_tweet_by_id("1741522811116753092")
        is_valid_cookies = tweet.user.id == "1450081635559428107"
        return is_valid_cookies, None
    except twikit.errors.Forbidden:
        is_valid_cookies = False
        cookies = await async_get_twitter_cookies(
            config["twikit_username"],
            config["twikit_email"],
            config["twikit_password"]
        )
        return is_valid_cookies, cookies


def validate_twitter_credentials() -> Optional[str]:
    """Validate twitter credentials"""
    return asyncio.run(async_validate_twitter_credentials())
