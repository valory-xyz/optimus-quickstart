const { publishOptions } = require('./constants/publishOptions');
const electronUpdater = require('electron-updater');
const logger = require('./logger');

const macUpdater = new electronUpdater.MacUpdater({
  ...publishOptions,
  channels: ['latest', 'beta', 'alpha'], // automatically update to all channels
});

macUpdater.setFeedURL({ ...publishOptions });

macUpdater.autoDownload = true;
macUpdater.autoInstallOnAppQuit = true;
macUpdater.logger = logger;

module.exports = { macUpdater };
