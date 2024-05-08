const { nativeImage } = require('electron');

const TRAY_ICONS_PATHS = {
  LOGGED_OUT: `${__dirname}/assets/icons/tray-logged-out.png`,
  LOW_GAS: `${__dirname}/assets/icons/tray-low-gas.png`,
  PAUSED: `${__dirname}/assets/icons/tray-paused.png`,
  RUNNING: `${__dirname}/assets/icons/tray-running.png`,
};

const TRAY_ICONS = {
  LOGGED_OUT: nativeImage.createFromPath(TRAY_ICONS_PATHS.LOGGED_OUT),
  LOW_GAS: nativeImage.createFromPath(TRAY_ICONS_PATHS.LOW_GAS),
  PAUSED: nativeImage.createFromPath(TRAY_ICONS_PATHS.PAUSED),
  RUNNING: nativeImage.createFromPath(TRAY_ICONS_PATHS.RUNNING),
};

module.exports = { TRAY_ICONS_PATHS, TRAY_ICONS };
