# Olas Operate
Electron + NextJS + Flask application to one-click run Agents.

## Technologies Used
- NextJS
- Electron
- AntD
- TypeScript
- Python
- Flask
- Poetry
- Docker v24


## Getting Started

### Application must run on a Linux instance
For development, we have been using Ubuntu 22.04.

### Ensure Docker v24 is installed

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
```bash
sudo apt install curl 
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
source ~/.bashrc
```

#### Install NodeJS LTS
```bash
nvm install --lts
```

### Ensure Yarn package manager is installed

```bash 
npm install --global yarn
```

### User must be in docker group

```bash
sudo usermod -aG docker $USER
```

Note: this may require a restart. After running this command, you should be able to run the following command from your terminal: 

```bash
docker run hello-world
```

### Install project dependencies

```bash
yarn
```

### Run the development app

```bash
yarn dev
```

This will run Electron, NextJS, Flask, and Hardhat concurrently.
