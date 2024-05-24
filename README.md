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

You can [install Docker Desktop via the Docker website](https://www.docker.com/products/docker-desktop/). Be sure to select the correct version for your system's CPU architecture.

If you are unsure about your system's CPU architecture, run the following command:
```bash
uname -p
# x86 64    Intel chip
# arm64     Apple chip
```

</details>

<details><summary><h3>Setting up your .env file</h3></summary>

Create a `.env` file in the root directory, or rename `.env.example` to `.env`.

#### NODE_ENV
For development usage, set `NODE_ENV=development`.
For production usage, set `NODE_ENV=production`.

#### FORK_URL

**Required for both development and production.**
**Must be a Gnosis Mainnet RPC URL.**

- In `development` this RPC url is forked by Hardhat, so you can interact with the chain without losing your assets.
- In `production` this RPC URL is used as the main RPC for Pearl.

You can get a Gnosis RPC from [Nodies](https://www.nodies.app/).

Then, set `FORK_URL=https://YOUR_RPC_URL_HERE` in your .env file.

Note: this must be an external RPC, not your hardhat node RPC, if using Hardhat.

### DEV_RPC

This RPC is only used while `NODE_ENV=development` is set.
It is used throughout Pearl as the main RPC.
This URL should be set as the RPC URL that you wish to connect to.

If you're using Hardhat, you can set `DEV_RPC=http://localhost:8545`.
Or, you can use another, external RPC URL here, ensuring that the chain ID is 100 (Gnosis Mainnet's chain ID).

</details>

<details><summary><h3>Installing project dependencies</h3></summary>

This command installs the required dependencies for the backend, frontend, and electron application.

```bash
yarn install-deps
```
</details>

<details><summary><h3>Running the development app</h3></summary>

In the root directory, run:

```bash
yarn start
```

This will run Electron, which launches the NextJS frontend and the Python backend as child processes.
</details>

<details><summary><h3>Chain forking (for development)</h3></summary>

In the interest of not losing funds, you can run a forked version of Gnosis Mainnet.

There are two recommended options:
- Tenderly
- Hardhat

<details><summary><h4>Tenderly (preferred)</h4></summary>
[Tenderly](https://tenderly.co/) is a service with a plethora of useful blockchain development tools. Of which, the core tool required here is the ability to **fork networks**.

1. Signup to [Tenderly](https://tenderly.co/), and select the plan you desire. **The Free plan should suffice for most users**.
2. Go to *Forks* under the *Development* tab -- in the left sidebar of your dashboard.
3. Click *Create Fork*, select "Gnosis Chain" as the network, and use Chain ID `100`.
4. Copy the RPC url into the appropriate .env variables in your repository. (Recommended to set both `FORK_URL` & `DEV_RPC` to this RPC url during development).
5. Click the *Fund Accounts* button to fund your accounts with XDAI (native token) and [OLAS](https://gnosisscan.io/token/0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f).
</details>

<details><summary><h4>Hardhat</h4></summary>
Note: using Hardhat will result in the loss of chain state once your Hardhat node is turned off.

Run the following command in the root of your project folder to start your Hardhat node:

```bash
npx hardhat node
```

**Once Hardhat is running, you will be able to use `http://localhost:8545` as your development RPC.**

##### Funding your addresses
There are a number of scripts to fund addresses for testing:

- XDAI funding:
```
poetry run python scripts/fund.py 0xYOURADDRESS
```
- OLAS funding: `TBA`

</details>


</details>

<details><summary><h3>Funding addresses while running a Hardhat fork</h3></summary>


</details>

## Further notes / issues

- Only one agent can be run at a time.
