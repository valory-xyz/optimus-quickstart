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

### Set master key in the backend folder

Currently the project runs using a Gnosis hardhat node.

On running the following command we are presented with a number of public and private keys. 

```bash
yarn dev:hardhat
```

Copy any one of these private keys into `/backend/.operate/master-key.txt`.

Be sure to kill the Hardhat node once you have completed this step.

### Run the development app

```bash
yarn dev
```

This will run Electron, NextJS, Flask, and Hardhat concurrently.

## Resetting the application

### Checking for lingering Docker containers

Ensure that there are no Docker containers left running by the application.

We can stop all containers by running the following command:
```bash
docker stop $(docker ps -a -q)
```

Then we can prune all the containers by running:
```bash
docker system prune
```

### Check for lingering processes on quit

Known bug where Next & Flask processes may linger after killing the application.

Check for lingering processes by running:
```bash
ps -a
```

Kill all lingering processes by running
```bash
killall electron python node next-server
``` 

## Further notes

- Only one agent can be run at a time.
- Hardhat node RPC is prepopulated for ease of use.