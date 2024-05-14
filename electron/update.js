const { publishOptions, updateKey } = require('./constants/publishOptions');
const electronUpdater = require('electron-updater');
const electronLogger = require('electron-log');

const macUpdater = new electronUpdater.MacUpdater({
  ...publishOptions,
  private: true,
  token: updateKey,
});

macUpdater.logger = electronLogger;

macUpdater.setFeedURL({
  ...publishOptions,
  token: updateKey,
  requestHeaders: {
    authorization: `Bearer ${updateKey}`,
  },
});

macUpdater.autoDownload = true;
macUpdater.autoInstallOnAppQuit = true;
macUpdater.logger = electronLogger;

module.exports = { macUpdater };
