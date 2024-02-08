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
