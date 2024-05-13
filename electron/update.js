const { publishOptions } = require('./constants/publishOptions');
const electronUpdater = require('electron-updater');

const macUpdater = new electronUpdater.MacUpdater(publishOptions);

macUpdater.autoDownload = true;
macUpdater.autoInstallOnAppQuit = true;
macUpdater.logger = require('electron-log');

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
