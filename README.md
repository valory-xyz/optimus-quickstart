<h1 align="center"> 
<b>Pearl<b>
</h1>

Pearl is an application used to run autonomous agents.

## Technologies Used
- Electron
- NodeJS (20.11)
- AntD
- TypeScript
- Python (3.10)
- Poetry (1.7.1)
- Docker (24)

## Getting Started

<details><summary><h3>Installing system dependencies</h3></summary>

The following installation scripts assume you have the following on each OS:
- Linux: a debian based operating system such as Ubuntu with `apt` to install packages.
- MacOS: [Homebrew](https://brew.sh/)
- ~~Windows: [Chocolatey](https://chocolatey.org/install)~~ (Coming soon...)

#### NodeJS via NVM

NodeJS is best installed and managed through NVM, which allows you to install and select the version of NodeJS you wish to use. For this project is the current LTS version 20.11.

##### Linux

```bash
sudo apt install curl 
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
source ~/.bashrc
nvm install --lts
nvm use --lts
```

##### MacOS

```bash
brew install nvm
```

Set up NVM for console usage. Dependant on the shell, you should edit the config file to contain the following code.
If you're using Bash or Zsh, you might add them to your `~/.bash_profile`, `~/.bashrc`, or `~/.zshrc` file:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

Close and reopen Terminal, or run `source ~/.bash_profile`, `source ~/.zshrc`, or `source ~/.bashrc` to reload the shell configuration.

Verify your installation by running `nvm --version`. Then run:

```bash
nvm install --lts
nvm use --lts
```

#### Yarn

```bash
npm install --global yarn
```

#### Python
##### Linux
```bash
sudo apt install python3
```
##### MacOS
```
brew install python
```

#### PIPX
##### Linux
```bash
sudo apt install pipx
```
##### MacOS
```bash
brew install pipx
```

#### Poetry
```bash
pipx install poetry
```
If promoted to run `pipx ensurepath`, run this command.

#### Docker
##### Linux
You can change the `ubuntu.22.04~jammy` version to your OS in the following command:
```bash
VERSION_STRING=5:24.0.7-1~ubuntu.22.04~jammy
sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```
If you are unsure of your current release version and codename to update the VERSION_STRING above, you can run:
```bash
lsb_release -a
```
##### MacOS

You must install Docker V24 manually, as brew does not allow for versioning with Docker.

- Docker Desktop version that supports Docker V24: [https://docs.docker.com/desktop/release-notes/#4261](https://docs.docker.com/desktop/release-notes/#4261)
- Guide to install: [https://docs.docker.com/desktop/install/mac-install/](https://docs.docker.com/desktop/install/mac-install/)

</details>

<details><summary><h3>Setup ENV file</h3></summary>

Create a `.env` file in the root directory, or rename `.env.example` to `.env`.

#### NODE_ENV
For development usage, set `NODE_ENV=development`.
For production usage, set `NODE_ENV=production`.

#### FORK_URL

**Required for forking Gnosis using a Hardhat node during development.**

You can get a Gnosis RPC from [Nodies](https://www.nodies.app/).

Then, set `FORK_URL=https://....` in your .env file.

Be sure to set an external RPC here.
</details>

<details><summary><h3>Install project dependencies</h3></summary>

This will install the required dependencies for the backend, frontend, and electron.

```bash
yarn install-deps
```
</details>

<details><summary><h3>Run the development app</h3></summary>

In the root directory, run:

```bash
yarn start
```

This will run Electron, which launches NextJS and the Backend as child processes.
</details>

<details><summary><h3>Starting Hardhat (for development)</h3></summary>

In the interest of not losing funds, we can run a Hardhat node that forks Gnosis -- provided the FORK_URL has been set to an external RPC in your .env file.

Run the following to start your Hardhat node:

```bash
npx hardhat node
```

**Once Hardhat is running, you can use `http://localhost:8545` during the agent spawning process as your RPC.**
</details>

<details><summary><h3>Funding addresses while running a Hardhat fork</h3></summary>
There are a number of scripts to fund addresses for testing:

- XDAI funding:
```
poetry run python scripts/fund.py 0xYOURADDRESS
```
- OLAS funding: `TBA`

</details>

## Further notes / issues

- Only one agent can be run at a time.
