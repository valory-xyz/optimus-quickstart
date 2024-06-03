const { publishOptions } = require('./constants/publishOptions');
const electronUpdater = require('electron-updater');
const electronLogger = require('electron-log');

const macUpdater = new electronUpdater.MacUpdater({
  ...publishOptions,
  channels: ['latest', 'beta', 'alpha'], // automatically update to all channels
});

macUpdater.logger = electronLogger;

macUpdater.setFeedURL({ ...publishOptions });

macUpdater.autoDownload = true;
macUpdater.autoInstallOnAppQuit = true;
macUpdater.logger = electronLogger;

module.exports = { macUpdater };
