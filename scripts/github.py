import requests

HTTP_OK = 200
GITHUB_REPO_LATEST_URL = "https://api.github.com/repos/{repo}/releases/latest"


def get_latest_tag(repo, default_tag):
    """Get the latest tag from Github"""

    response = requests.get(
        url=GITHUB_REPO_LATEST_URL.replace("{repo}", repo),
        timeout=60
    )

    if response.status_code != HTTP_OK:  # type: ignore
        return default_tag

    try:
        version = response.json()["tag_name"]
        return version
    except Exception:
        return default_tag
