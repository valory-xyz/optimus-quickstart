// Installation helpers.

const fs = require('fs');
const { spawnSync } = require('child_process');
const os = require('os');

const OperateDirectory = `${os.homedir()}/.operate`;
const OperateCmd = `${os.homedir()}/.operate/venv/bin/operate`;

function runSync(command, options) {
  let process = spawnSync(command, options);
  return {
    error: process.error,
    stdout: process.stdout?.toString(),
    stderr: process.stderr?.toString(),
  };
}

function isPythonInstalledDarwin() {
  return runSync('/opt/homebrew/bin/python3.10', ['--version']);
}

function installPythonDarwin() {
  return runSync('/opt/homebrew/bin/brew', ['install', 'python@3.10']);
}

function createVirtualEnvDarwin(path) {
  return runSync('/opt/homebrew/bin/python3.10', ['-m', 'venv', path]);
}

function isPythonInstalledUbuntu() {
  return runSync('/usr/bin/python3.10', ['--version']);
}

function installPythonUbuntu() {
  return runSync('/usr/bin/apt', ['install', 'python3.10 ', 'python3.10-dev']);
}

function createVirtualEnvUbuntu(path) {
  return runSync('/usr/bin/python3.10', ['-m', 'venv', path]);
}

function installOperatePackage(path) {
  return runSync(`${path}/venv/bin/python3.10`, [
    '-m',
    'pip',
    'install',
    'git+https://github.com/valory-xyz/olas-operate-app.git@a2d203ad2d6c716a66a8d184ab77909b5ab22a85#egg=operate',
  ]);
}

function installOperateAppDarwin(path) {
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

function installOperateAppUbuntu(path) {
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

async function setupDarwin() {
  let installCheck;
  // Python installation check
  if (isPythonInstalledDarwin().error) {
    installCheck = installPythonDarwin();
    if (installCheck.error) {
      throw new Error(
        `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
      );
    }
  }

  // Create required directories
  await createDirectory(`${OperateDirectory}`);
  await createDirectory(`${OperateDirectory}/temp`);

  // Create a virtual environment
  installCheck = createVirtualEnvDarwin(`${OperateDirectory}/venv`);
  if (installCheck.error) {
    throw new Error(
      `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
    );
  }

  // Install operate app
  installCheck = installOperatePackage(OperateDirectory);
  if (installCheck.error) {
    throw new Error(
      `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
    );
  }
  installCheck = installOperateAppDarwin(OperateDirectory);
  if (installCheck.error) {
    throw new Error(
      `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
    );
  }
}

async function setupUbuntu() {
  // Python installation check
  if (!(await isPythonInstalledUbuntu())) {
    console.log('Installing Python');
    if (!(await installPythonUbuntu())) {
      throw new Error('Could not install python');
    }
  }

  // Create required directories
  await createDirectory(`${OperateDirectory}`);
  await createDirectory(`${OperateDirectory}/temp`);

  // Create a virtual environment
  installCheck = createVirtualEnvUbuntu(`${OperateDirectory}/venv`);
  if (installCheck.error) {
    throw new Error(
      `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
    );
  }

  // Install operate app
  installCheck = installOperatePackage(OperateDirectory);
  if (installCheck.error) {
    throw new Error(
      `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
    );
  }
  installCheck = installOperateAppUbuntu(OperateDirectory);
  if (installCheck.error) {
    throw new Error(
      `Error: ${installCheck.error}; Stdout: ${installCheck.stdout}; Stderr: ${installCheck.stderr}`,
    );
  }
}

function isInstalled() {
  return fs.existsSync(OperateDirectory);
}

module.exports = {
  setupDarwin,
  setupUbuntu,
  isInstalled,
  OperateDirectory,
  OperateCmd,
};
