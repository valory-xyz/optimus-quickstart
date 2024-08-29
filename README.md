<h1 align="center">
<b>Optimus Quickstart</b>
</h1>

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

- You need xDAI on Gnosis Chain in one of your wallets.
- You need an RPC for your agent instance. We recommend [Nodies RPC](https://www.nodies.app/).
- (From release v0.16.0 onwards) You may need a Subgraph API key that can be obtained at [The Graph](https://thegraph.com/studio/apikeys/). If you do not have such an API key you can optionally press 'Enter' directly (with no input) when prompted by the CLI.

## Run the Service

Clone this repository locally and execute:

<h2 align="left">
<b>Compatible Systems</b>
</h2>

- Windows 10/11: WSL2 / Git BASH
- Mac ARM / Intel
- Linux
- Raspberry Pi 4

<h2 align="left">
<b>System Requirements</b>
</h2>

Ensure your machine satisfies the requirements:

- Python ==3.10
- Poetry >=1.4.0
- Docker Engine <25.0.0
- Docker Compose


### Service is Running

Once the command has completed, i.e. the service is running, you can see the live logs with:

```bash
docker logs optimus_abci_0 --follow
```

To stop your agent, use:

```bash
./stop_service.sh
```

### Backups

Agent runners are recommended to create a [backup](https://github.com/valory-xyz/trader-quickstart#backup-and-recovery) of the relevant secret key material.

## Update between versions

Simply pull the latest script:

```bash
git pull origin
```

Then continue above with "Run the script".

## Advice for Mac users

In Docker Desktop make sure that in `Settings -> Advanced` the following boxes are ticked

![Docker Desktop settings](images/docker.png)

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


## Backup and Recovery

TODO

## RPC-related Error Messages

When updating the service, you may need to re-run the script if you obtain any of the following error messages:

```Error: Service terminatation failed with following error; ChainTimeoutError(Timed out when waiting for transaction to go through)

Error: Service unbonding failed with following error; ChainTimeoutError(Timed out when waiting for transaction to go through)

Error: Component mint failed with following error; ChainTimeoutError(Timed out when waiting for transaction to go through)

Error: Service activation failed with following error; ChainTimeoutError(Timed out when waiting for transaction to go through)

Error: Service deployment failed with following error; ChainTimeoutError(Timed out when waiting for transaction to go through)

Error: Service terminatation failed with following error; ChainInteractionError({'code': -32010, 'message': 'AlreadyKnown'})
```
