<h1 align="center">
<b>Optimus Quickstart</b>
</h1>

## Terms and Conditions Disclaimer

> :warning: **Warning** <br />
> The code within this repository is provided without any warranties. It leverages third party APIs and it is important to note that the code has not been audited for potential security vulnerabilities.
> Using this code could potentially lead to loss of funds, compromised data, or asset risk.
> Exercise caution and use this code at your own risk. Please refer to the [LICENSE](./LICENSE) file for details about the terms and conditions.

## Compatible Systems

- Windows 10/11: WSL2 / Git BASH
- Mac ARM / Intel
- Linux
- Raspberry Pi 4

## System Requirements

Ensure your machine satisfies the requirements:

- Python `==3.10`
- [Poetry](https://python-poetry.org/docs/) `>=1.4.0`
- [Docker Engine](https://docs.docker.com/engine/install/) `<25.0.0`
- [Docker Compose](https://docs.docker.com/compose/install/)

## Resource Requirements

- You need ETH and USDC in one of your wallets. We recommend having $10 worth of ETH and USDC on Etherum. 
- You need 3 RPCs for your agent instance for respectively Ethereum, Optimism, and Base. You can use the following public ones: 

  ```bash
  Ethereum RPC: https://virtual.mainnet.rpc.tenderly.co/4b1b935c-2ad1-4f63-88c4-f74eaae37123

  Optimism RPC: https://virtual.optimism.rpc.tenderly.co/2ba819d3-6ee1-4075-a145-6eaaeb58e5b7

  Base RPC: https://virtual.base.rpc.tenderly.co/a5594f32-3ec3-4ea5-8a91-6d5d7d9e290b
  ```
- Finally, you will need your Tenderly Access Key, Tenderly account Slug, and Tenderly Project Slug. Get one at https://dashboard.tenderly.co/. Refer to the Tenderly Documentation for more info https://docs.tenderly.co/account/projects. 


## Run the Service

Clone this repository locally and execute:
```bash
chmod +x run_service.sh
./run_service.sh
```
When prompted, add the corresponding RPCs (you can copy-paste the ones in the section above) and Tenderly info, send funds to the prompted address and you're good to go!

### Service is Running

Once the command has completed, i.e. the service is running, you can see the live logs with:

```bash
docker logs optimus_abci_0 --follow
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


## Advice for Windows users using Git BASH

We provide some hints to have your Windows system ready to run the agent. The instructions below have been tested in Windows 11.

Execute the following steps in a PowerShell terminal:

1. Install [Git](https://git-scm.com/download/win) and Git Bash:

    ```bash
    winget install --id Git.Git -e --source winget
    ```

2. Install Python 3.10:

    ```bash
    winget install Python.Python.3.10
    ```

3. Close and re-open the PowerShell terminal.

4. Install [Poetry](https://python-poetry.org/docs/):

    ```bash
    curl.exe -sSL https://install.python-poetry.org | python -
    ```

5. Add Poetry to your user's path:

    ```bash
    $existingUserPath = (Get-Item -Path HKCU:\Environment).GetValue("PATH", $null, "DoNotExpandEnvironmentNames")

    $newUserPath = "$existingUserPath;$Env:APPDATA\Python\Scripts"

    [System.Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    ```

6. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/):

    ```bash
    winget install -e --id Docker.DockerDesktop
    ```

7. Log out of your Windows session and then log back in.

8. Open [Docker Desktop](https://www.docker.com/products/docker-desktop/) and leave it opened in the background.

Now, open a Git Bash terminal and follow the instructions in the "[Run the script](#run-the-script)" section as well as the subsequent sections. You might need to install Microsoft Visual C++ 14.0 or greater.



