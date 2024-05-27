<h1 align="center">
<b>Pearl</b>
</h1>

Pearl is an application used to run autonomous agents powered by the OLAS Network.

## Technologies Used

- Electron
- NodeJS (20.11 LTS)
- AntD (^5)
- NextJS (^14)
- Javascript / TypeScript
- Python (3.10)
- Poetry (^1.7.1)
- Docker Engine

## Getting Started

### Installing system dependencies

The following installation steps assume you have the following on each OS:

- Linux: a debian based operating system such as Ubuntu with `apt` to install packages.
- MacOS: [Homebrew](https://brew.sh/)

<details><summary><h4>NodeJS</summary></h4>

NodeJS is best installed and managed through NVM. It allows you to install and select specific versions of NodeJS. Pearl has been built using version 20.11, LTS.

<h5>Linux</h5>

```bash
sudo apt install curl 
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
source ~/.bashrc
nvm install --lts
nvm use --lts
```

<h5>MacOS</h5>

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

</details>

<details><summary><h4>Yarn</h4></summary>

Yarn is the package manager used for dependency management of the Electron app and NextJS frontend.

```bash
npm install --global yarn
```
</details>

<details><summary><h4>Python</h4></summary>

<h5>Linux</h5>

```bash
sudo apt install python3
```

<h5>MacOS</h5>

```bash
brew install python
```

</details>

<details><summary><h4>PIPX</h4></summary>

<h5>Linux</h5>

```bash
sudo apt install pipx
```

<h5>MacOS</h5>

```bash
brew install pipx
```

</details>

<details><summary><h4>Poetry</h4></summary>

Poetry is used on the backend to install and manage dependencies, and create a virtual environment for the backend API.

```bash
pipx install poetry
```

If promoted to run `pipx ensurepath`, run it.

</details>

<details><summary><h4>Docker</h4></summary>

<h5>Linux</h5>

*Update the `ubuntu.22.04~jammy` version string to your current OS version before running the following command:*

```bash
VERSION_STRING=5:24.0.7-1~ubuntu.22.04~jammy
sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

If you are unsure about your current OS version/codename, you can find it by running:

```bash
lsb_release -a
```

<h5>MacOS</h5>

You can [install Docker Desktop via the Docker website](https://www.docker.com/products/docker-desktop/). Be sure to select the correct version for your system's CPU architecture.

If you are unsure about your system's CPU architecture, run the following command:

```bash
uname -p
# x86 64    Intel chip
# arm64     Apple chip
```

</details>

<h3>Setting up your .env file</h3>

Create an `.env` file in the root directory, or rename `.env.example` to `.env`.
Then set the following environment variables.

<details><summary><h4>NODE_ENV</h4></summary>

For development usage, set `NODE_ENV=development`.
For production usage, set `NODE_ENV=production`.

</details>

<details><summary><h4>FORK_URL</h4></summary>

**This variable is required for both development and production.**
**Must be a Gnosis Mainnet RPC URL.**

- In `development` this RPC url is only used if/when forking mainnet with Hardhat (covered later). This process allows you to test without losing funds.
- In `production` this RPC URL is used as the main RPC for Pearl.

You can get a Gnosis RPC from [Nodies](https://www.nodies.app/).

Once you have a Gnosis Mainnet RPC URL, set `FORK_URL=YOUR_RPC_URL_HERE` in your .env file.

Note: this must be an external RPC. If you decide to use Hardhat for testing on a mainnet fork, do _not_ set your Hardhat Node URL here.
</details>

<details><summary><h4>DEV_RPC</h4></summary>

This environment variable is only used when `NODE_ENV=development` is set.

In `development` mode, it is used throughout Pearl as the main RPC.

If you're using Hardhat, you can set `DEV_RPC=http://localhost:8545`.
Or, you can use another, external RPC URL that wish to test on, ensuring that the chain ID is 100 (Gnosis Mainnet's chain ID).

</details>

<h3>Installing project dependencies</h3>

Run the following command to install all project dependencies.

```bash
yarn install-deps
```

<h3>Running the application</h3>

Provided your system dependencies are installed, environment variables are set, and your RPC is running.

You can start Pearl by running the following command in the root directory:

```bash
yarn start
```

This will run Electron, which launches the NextJS frontend and the Python backend as child processes.

<h3>Chain forking (for development)</h3>

In the interest of protecting your funds during development, you can run a forked version of Gnosis Mainnet.

There are two recommended options, choose one:

<details><summary><h4>Tenderly (preferred)</h4></summary>

[Tenderly](https://tenderly.co/) is a service with a plethora of useful blockchain development tools. The tool required here gives you the ability to **fork networks**.

You can also monitor all transactions, and fund your accounts with any token that you please.

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

<h5>Funding your addresses with Hardhat</h5>

There are scripts to fund addresses during testing/development:

- XDAI funding:

```bash
poetry run python scripts/fund.py 0xYOURADDRESS
```

- OLAS funding: 

```bash
poetry run python scripts/transfer_olas.py PATH_TO_KEY_CONTAINING_OLAS ADDRESS_TO_TRANSFER AMOUNT
```

</details>

<h2>Notes and Common Issues</h2>

- If Pearl is running, it will kill any attempt to run another Pearl instance. This is to ensure there are no port conflicts.
- Enivironment variables are cached in the terminal, if you change them while your terminal is open, you will need to restart the terminal.