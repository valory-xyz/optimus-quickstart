const { publishOptions, updateKey } = require('./constants/publishOptions');
const electronUpdater = require('electron-updater');
const electronLogger = require('electron-log');

const macUpdater = new electronUpdater.MacUpdater({
  ...publishOptions,
  token: updateKey,
});

macUpdater.setFeedURL({
  ...publishOptions,
  url: 'https://api.github.com/repos/valory-xyz/olas-operate-app/releases/latest',
  requestHeaders: {
    authorization: `Bearer ${updateKey}`,
  },
});
macUpdater.autoDownload = true;
macUpdater.autoInstallOnAppQuit = true;
macUpdater.logger = electronLogger;

macUpdater.on('update-not-available', () => {
  console.log('No updates available');
});

macUpdater.on('download-progress', (progress) => {
  console.log(`Progress: ${progress}`);
});

macUpdater.on('update-downloaded', () => {
  macUpdater.quitAndInstall();
});

macUpdater.on('checking-for-update', () => {
  console.log('Checking for update');
});

macUpdater.on('error', (err) => {
  console.error(err);
});

module.exports = { macUpdater };
