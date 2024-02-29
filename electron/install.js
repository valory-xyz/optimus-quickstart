// Installation helpers.

const fs = require('fs');
const os = require('os');
const sudo = require('sudo-prompt');
const process = require('process');
const { spawnSync } = require('child_process');


const OperateDirectory = `${os.homedir()}/.operate`;
const OperateCmd = `${os.homedir()}/.operate/venv/bin/operate`;
const Env = { ...process.env, PATH: `${process.env.PATH}:/opt/homebrew/bin/brew:/usr/local/bin` }
const SudoOptions = {
  name: "Olas Operate",
  env: Env,
}

function getBinPath(command) {
  return spawnSync("/usr/bin/which", [command], { env: Env }).stdout?.toString().trim()
}

function isPackageInstalledUbuntu(package) {
  const result = spawnSync('/usr/bin/bash', ['-c', `/usr/bin/apt list --installed | grep -q "^${package}/"`], { env: Env });
  return result.status === 0;
}

function runCmdUnix(command, options) {
  let bin = getBinPath(command)
  if (!bin) {
    throw new Error(`Command ${command} not found; Path : ${Env.PATH}`)
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

function runSudoUnix(command, options) {
  let bin = getBinPath(command)
  if (!bin) {
    throw new Error(`Command ${command} not found`)
  }
  return new Promise(function (resolve, reject) {
    sudo.exec(
      `${bin} ${options}`,
      SudoOptions,
      function (error, stdout, stderr) {
        resolve({
          error: error,
          stdout: stdout,
          stderr: stderr,
        })
      }
    );
  })
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
  return runSudoUnix("bash", `${__dirname}/scripts/install_docker_ubuntu.sh`)
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

function isGitInstalledUbuntu() {
  return Boolean(getBinPath("git"));
}

function installPythonUbuntu() {
  return runSudoUnix('apt', 'install -y python3.10 python3.10-dev');
}

function installGitUbuntu() {
  return runSudoUnix('apt', 'install -y git');
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
    await installDockerUbuntu()
  }

  console.log("Checking python installation")
  if (!isPythonInstalledUbuntu()) {
    console.log("Installing Python")
    await installPythonUbuntu(OperateDirectory)
  }

  console.log("Checking git installation")
  if (!isGitInstalledUbuntu()) {
    console.log("Installing git")
    await installGitUbuntu(OperateDirectory)
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
