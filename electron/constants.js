const PORT_RANGE = { startPort: 39152, endPort: 65535 };
const ERROR_ADDRESS_IN_USE = 'EADDRINUSE';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

module.exports = {
  PORT_RANGE,
  ERROR_ADDRESS_IN_USE,
  isWindows,
  isMac,
  isLinux,
  isProd,
  isDev,
};
