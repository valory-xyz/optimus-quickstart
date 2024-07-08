const os = require('os');
const path = require('path');
const fs = require('fs');
const { isProd } = require('../constants');

const dotOperateDirectory = isProd
  ? path.join(os.homedir(), '.operate')
  : '.operate';

// Create operate directory if it doesn't exist
if (!fs.existsSync(dotOperateDirectory)) {
  fs.mkdirSync(dotOperateDirectory);
}

const paths = {
  dotOperateDirectory,
  servicesDir: path.join(dotOperateDirectory, 'services'),
  venvDir: path.join(dotOperateDirectory, 'venv'),
  tempDir: path.join(dotOperateDirectory, 'temp'),
  versionFile: path.join(dotOperateDirectory, 'version.txt'),
  cliLogFile: path.join(dotOperateDirectory, 'cli.log'),
  electronLogFile: path.join(dotOperateDirectory, 'electron.log'),
  nextLogFile: path.join(dotOperateDirectory, 'next.log'),
  osPearlTempDir: path.join(os.tmpdir(), 'pearl'),
};

module.exports = { paths };
