// Installation helpers.

const fs = require('fs');
const { exec } = require("child_process");
const os = require('os');

const UserHomeDirectory = `${os.homedir()}/.operate`;

function isPythonInstalled() {
    return new Promise((resolve, reject) => {
        exec('python3.10 --version', (error, stdout, stderr) => {
            resolve(!error);
        });
    });
}

function installPythonDarwin() {
    return new Promise((resolve, reject) => {
        exec('brew install python@3.10', (error, stdout, stderr) => {
            resolve(!error)
        });
    });
}

function createVirtualEnv(path) {
    return new Promise((resolve, reject) => {
        exec(`python3.10 -m venv ${path}`, (error, stdout, stderr) => {
            resolve(!error);
        });
    });
}

function installOperatePackage(path) {
    return new Promise((resolve, reject) => {
        exec(`${path}/venv/bin/python3.10 -m pip install git+https://github.com/valory-xyz/olas-operate-app.git@44388a82d29ce4d96e554c828c3c2c12d6ee3b8a#egg=operate`, (error, stdout, stderr) => {
            resolve(!error);
        });
    });
}

function installOperateAppDarwin(path) {
    return new Promise((resolve, reject) => {
        fs.copyFile(`${path}/venv/bin/operate`, "/opt/homebrew/bin/operate", function (error, stdout, stderr) {
            resolve(!error)
        })
    });
}

function createDirectory(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, { recursive: true }, (error) => {
            resolve(!error);
        });
    });
}

export async function setupDarwin() {

    // Python installation check
    if (!await isPythonInstalled()) {
        console.log("Installing Python")
        if (!await installPythonDarwin()) {
            throw new Error("Could not install python")
        }
    }

    // Create required directories
    await createDirectory(`${UserHomeDirectory}`)
    await createDirectory(`${UserHomeDirectory}/temp`)

    // Create a virtual environment
    await createVirtualEnv(`${UserHomeDirectory}/venv`)

    // Install operate app
    await installOperatePackage(UserHomeDirectory)
    await installOperateAppDarwin(UserHomeDirectory)
}
