<h1 align="center">
<b>Memeooorr Quickstart</b>
</h1>

## Terms and Conditions Disclaimer

> :warning: **Warning** <br />
> The code within this repository is provided without any warranties. It leverages third party APIs and it is important to note that the code has not been audited for potential security vulnerabilities.
> Using this code could potentially lead to loss of funds, compromised data, or asset risk.
> Exercise caution and use this code at your own risk. Please refer to the [LICENSE](./LICENSE) file for details about the terms and conditions.

## Compatible Systems

- Windows 10/11: WSL2
- Mac ARM / Intel
- Linux
- Raspberry Pi 4

## System Requirements

Ensure your machine satisfies the requirements:

- Python `==3.10`
- [Poetry](https://python-poetry.org/docs/) `>=1.4.0`
- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Memeooorr Agent: Functionality Overview

**Supported Chains:**
The Memeooorr agent currently operates on the following chains:
- Base
- Celo

See [here](https://github.com/dvilelaf/meme-ooorr?tab=readme-ov-file#user-flow) for what it does.

- For the initial setup you will need to fund certain addresses with the following funds when requested: 0.08 ETH (Ethereum mainnet) + 20 USDC (Ethereum mainnet) + 0.04 ETH (Optimism chain) + 0.04 ETH (Base chain). These quantities are based on the gas prices seen on the 1st half of Sept 2024 and may need to be revised. Additionally some quantity of OLAS bridged to Optimism if you want to stake.

- You need 3 RPCs for your agent instance for respectively Ethereum, Optimism, and Base.
```bash
Please enter an Ethereum RPC URL:
Please enter an Optimism RPC URL:
Please enter a Base RPC URL:
  ```

## Run the Service

Clone this repository locally and execute:
```bash
chmod +x run_service.sh
./run_service.sh
```
When prompted, add the corresponding RPCs info, send funds to the prompted address and you're good to go!

### Creating a local user account

When run for the first time, the agent will setup for you a password protected local account. You will be asked to enter and confirm a password as below. 
Please be mindful of storing it in a secure space, for future use. **Hint:** If you do not want to use a password just press Enter when asked to enter and confirm your password.

```bash
Creating a new local user account...
Please enter a password: 
Please confirm your password: 
Creating the main wallet...
```

## Staking

The agent will need your answer on staking. If you plan to run it as a non staking agent, please answer _n_ to the question below. Otherwise, please answer _y_ and, consequently when prompted, fund your agent with the required number of bridged Olas in Optimism Chain.

```bash
Do you want to stake your service? (y/n):
```

### Notes:

- Staking is currently in a testing phase, so the number of trader agents that can be staked might be limited.
- Within each staking period (24hrs) staking happens after the agent has reached its staking contract's KPIs. In the current agent's version, this takes approxiamtely 45 minutes of activity.
- In case a service becomes inactive and remains so for more than 2 staking periods (approx. 48 hours), it faces eviction from the staking program and ceases to accrue additional rewards.

### Service is Running

Once the command has completed, i.e. the service is running, you can see the live logs with:

```bash
docker logs optimus_abci_0 --follow
```
Execute the report command to view a summary of the service status:

```bash
poetry run python report.py
```
To inspect the tree state transition of the current run of the agent run:
```bash
poetry run autonomy analyse logs --from-dir .optimus/services/[service-hash]/deployment/persistent_data/logs/  --agent aea_0 --fsm --reset-db
```
where `[service-hash]` is the onchain representation of the agent code that you're running and can be found by doing

```bash
ls .optimus/services
```

To stop your agent, use:

```bash
./stop_service.sh
```

## Update between versions

Simply pull the latest script:

```bash
git pull origin
```

Then continue above with "Run the script".

## What's New

...

## Advice for Windows users on installing Windows Subsystem for Linux version 2 (WSL2)

1. Open a **Command Prompt** terminal as an Administrator.

2. Run the following commands:

    ```bash
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    ```

    ```bash
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    ```

3. Then restart the computer.

4. Open a **Command Prompt** terminal.

5. Make WSL2 the default version by running:

    ```bash
    wsl --set-default-version 2
    ```

6. Install Ubuntu 22.04 by running:

    ```bash
    wsl --install -d Ubuntu-22.04
    ```

7. Follow the on-screen instructions and set a username and password for your Ubuntu installation.

8. Install Docker Desktop and enable the WSL 2 backend by following the instructions from Docker [here](https://docs.docker.com/desktop/wsl/).
