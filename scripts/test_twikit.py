import json
from pathlib import Path
import twikit
import asyncio


async def test_twikit():
    """Test cookies"""

    with open(Path(".memeooorr", "local_config.json"), "r", encoding="utf-8") as config_file:
        config = json.load(config_file)
        cookies = json.loads(config["twikit_cookies"])

    client = twikit.Client(
        language="en-US"
    )
    client.set_cookies(cookies)

    tweet = await client.get_tweet_by_id("1741522811116753092")
    return tweet.user.id == "1450081635559428107"

ok = asyncio.run(test_twikit())
print("Cookies are valid" if ok else "Cookies are not valid")
