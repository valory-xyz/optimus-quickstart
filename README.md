# Olas Operate
Electron + NextJS + Backend application to one-click run Agents.

## Technologies Used

- NextJS (20.11 LTS)
- Electron
- AntD
- TypeScript
- Python (3.10)
- Poetry (1.7.1)
- Docker (24)

## Getting Started

### Application must run on a Linux instance

For development, we have been using Ubuntu 22.04.

### Setup ENV file

Create an `.env` file in the root directory, or rename `.env.example` to `.env`.

For development usage, set `NODE_ENV=development`.
For production usage, set `NODE_ENV=production`.

### Ensure Docker v24 is installed

You can change the ubuntu.XX.XX~XX version to your OS in the following command:

```bash
VERSION_STRING=5:24.0.7-1~ubuntu.22.04~jammy
sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin
```

### Ensure pipx is installed

```bash
sudo apt install pipx
```

### Ensure poetry is installed

```bash
pipx install poetry
```

If promoted to run `pipx ensurepath`, run this command.

### Ensure NVM and NodeJS LTS are installed

#### Install NVM

Node version manager will allow you to quickly install and use different NodeJS versions.

```bash
sudo apt install curl 
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
source ~/.bashrc
```

#### Install NodeJS LTS

Provided NVM is installed, you will be able to install the currently NodeJS LTS version (20.11)

```bash
nvm install --lts
nvm use --lts
```

### Ensure Yarn package manager is installed

Yarn is the package manager used for Electron and the frontend.

```bash 
npm install --global yarn
```

### User must be in docker group

```bash
sudo usermod -aG docker $USER
```

**Note: this may require a restart. **

After running the above command, you should be able to run the following command from your terminal: 

```bash
docker run hello-world
```

### Install project dependencies

This will install the required dependencies for the backend, frontend, and electron.

```bash
yarn install-deps
```

### Set private key

Dependant on your intentions, there are two routes.

If you wish to test both the staking and non-staking agent spawning, you must use the private key for a wallet that has an appropriate amount of OLAS for staking.

If you only wish to test the non-staking agent spawning, you can set a Hardhat private key as wallet's OLAS balance will not be checked.


#### Staking route

This route will check the wallet set in `/backend/.operate/key.txt` for OLAS prior to creating an agent in "staking mode".

Set a private key in the above mentioned file, ensuring it is prefixed with `0x`.

#### Non-staking route (using a Hardhat assigned wallet)

** Do not send funds to a Hardhat assigned wallet on mainnet **.

This route will not poll for Olas, and therefore you can set any private key in the `key.txt` file mentioned below.

The project runs a Gnosis hardhat node -- this is temporary for early development phase.

On running the following command we are presented with a number of public and private keys. 

```bash
yarn dev:hardhat
```

Copy any one of these private keys into `/backend/.operate/key.txt`.

Be sure to kill the Hardhat node once you have completed this step.

### Run the development app

**If you are using the app in `production` mode** (having set this in your `.env` file), you will need to build the frontend first. You can achieve this by running: 

```bash
yarn build:frontend
```

**Ensure ports: 3000 (for frontend), 8000 (for backend), 8545 (for hardhat node); are free.**

In the root directory, run:

```bash
yarn start
```

This will run Electron which launches NextJS, Backend, and Hardhat as child processes.

## Further notes / issues

- Only one agent can be run at a time.
- Hardhat node RPC is pre-populated during Spawn process for ease of development, this will be removed.
- Uncomment `mainWindow.webContents.openDevTools()` in electron/main.js to display Chromium dev tools in the Electron app
- "Delete endpoint" not currently avaiable, you must manually delete the relevant service directories from the /backend/operate/services folder to remove them, the app must be restarted after this.
- Port conflict solution has not been implemented yet.