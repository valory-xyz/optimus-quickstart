// Installation helpers.

const fs = require('fs');
const os = require('os');
const sudo = require('sudo-prompt');
const process = require('process');
const { spawnSync } = require('child_process');


const OperateDirectory = `${os.homedir()}/.operate`;
const OperateCmd = `${os.homedir()}/.operate/venv/bin/operate`;

function getBinPath(command) {
  return spawnSync("/usr/bin/which", [command]).stdout?.toString().trim()
}

function runCmdUnix(command, options) {
  let bin = getBinPath(command)
  if (!bin) {
    throw new Error(`Command ${command} not found`)
  }
  let output = spawnSync(bin, options);
  if (output.error) {
    throw new Error(
      `Error running ${command} with options ${options}; 
            Error: ${output.error}; Stdout: ${output.stdout}; Stderr: ${output.stderr}`,
    );
  }
  return {
    error: output.error,
    stdout: output.stdout?.toString(),
    stderr: output.stderr?.toString(),
  };
}

function runSudo(command) {
  return sudo.exec(
    command,
    options,
    function (error, stdout, stderr) {
      return {
        error: error,
        stdout: stdout,
        stderr: stderr,
      }
    }
  );
}

function isBrewInstalled() {
  return Boolean(getBinPath(getBinPath("brew")));
}

function installBrew() {
  return runCmdUnix('bash', ['-c', '$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)'])
}

function isDockerInstalledDarwin() {
  return Boolean(getBinPath("docker"));
}

function installDockerDarwin() {
  return runCmdUnix('brew', ['install', 'docker'])
}

function isDockerInstalledUbuntu() {
  return Boolean(getBinPath("docker"));
}

function installDockerUbuntu() {

  // Add Docker's official GPG key:
  runSudo('apt-get update')
  runSudo('apt-get install ca-certificates curl')
  runSudo('install -m 0755 -d /etc/apt/keyrings')
  runSudo('curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc')
  runSudo('chmod a+r /etc/apt/keyrings/docker.asc')

  // Add the repository to Apt sources:
  runSudo('echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null')
  runSudo('apt-get update')

  // Install
  runSudo('apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin')
}

function isPythonInstalledDarwin() {
  return Boolean(getBinPath("python3.10"))
}

function installPythonDarwin() {
  return runCmdUnix('brew', ['install', 'python@3.10']);
}

function createVirtualEnvUnix(path) {
  return runCmdUnix('python3.10', ['-m', 'venv', path]);
}

function isPythonInstalledUbuntu() {
  return Boolean(getBinPath("python3.10"));
}

function installPythonUbuntu() {
  return runCmdUnix('apt', ['install', 'python3.10 ', 'python3.10-dev']);
}

function createVirtualEnvUbuntu(path) {
  return runCmdUnix('python3.10', ['-m', 'venv', path]);
}

function cloneRepositoryUnix() {
  runCmdUnix('git', ['clone', 'git@github.com:valory-xyz/olas-operate-app'])
}

function installOperatePackageUnix(path) {
  runCmdUnix(`${path}/venv/bin/python3.10`, ['-m', 'pip', 'install', `${path}/temp/olas-operate-app`])
}

function installOperateCliDarwin(path) {
  return new Promise((resolve, reject) => {
    fs.copyFile(
      `${path}/venv/bin/operate`,
      '/opt/homebrew/bin/operate',
      function (error, stdout, stderr) {
        resolve(!error);
      },
    );
  });
}

function installOperateCliUbuntu(path) {
  return new Promise((resolve, reject) => {
    fs.copyFile(
      `${path}/venv/bin/operate`,
      '/usr/local/bin',
      function (error, stdout, stderr) {
        resolve(!error);
      },
    );
  });
}

function createDirectory(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (error) => {
      resolve(!error);
    });
  });
}

function isInstalled() {
  return fs.existsSync(OperateDirectory);
}

async function setupDarwin() {
  console.log("Checking brew installation")
  if (!isBrewInstalled()) {
    console.log("Installing brew")
    installBrew()
  }

  console.log("Checking docker installation")
  if (!isDockerInstalledDarwin()) {
    console.log("Installating docker")
    installDockerDarwin()
  }

  console.log("Checking python installation")
  if (!isPythonInstalledDarwin()) {
    console.log("Installing python")
    installPythonDarwin()
  }

  console.log("Creating required directories")
  await createDirectory(`${OperateDirectory}`);
  await createDirectory(`${OperateDirectory}/temp`);

  console.log("Creating virtual environment")
  createVirtualEnvUnix(`${OperateDirectory}/venv`);

  console.log("Installing operate backend")
  process.chdir(`${OperateDirectory}/temp`)
  cloneRepositoryUnix()
  installOperatePackageUnix(OperateDirectory)

  console.log("Installing operate CLI")
  await installOperateCliDarwin(OperateDirectory)
}

async function setupUbuntu() {

  console.log("Checking docker installation")
  if (!isDockerInstalledUbuntu()) {
    console.log("Installating docker")
    installDockerUbuntu()
  }

  console.log("Checking python installation")
  if (!isPythonInstalledUbuntu()) {
    console.log("Installing Python")
    installPythonUbuntu(OperateDirectory)
  }

  console.log("Creating required directories")
  await createDirectory(`${OperateDirectory}`);
  await createDirectory(`${OperateDirectory}/temp`);

  console.log("Creating virtual environment")
  createVirtualEnvUbuntu(`${OperateDirectory}/venv`);


  console.log("Installing operate backend")
  process.chdir(`${OperateDirectory}/temp`)
  cloneRepositoryUnix()
  installOperatePackageUnix(OperateDirectory)

  console.log("Installing operate CLI")
  await installOperateCliUbuntu(OperateDirectory)
}

module.exports = {
  setupDarwin,
  setupUbuntu,
  isInstalled,
  OperateDirectory,
  OperateCmd,
};
