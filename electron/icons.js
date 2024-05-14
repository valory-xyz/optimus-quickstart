const { nativeImage } = require('electron');

const TRAY_ICONS_PATHS = {
  LOGGED_OUT: `${__dirname}/assets/icons/trayLoggedOutTemplate.png`,
  // LOGGED_OUT: `${__dirname}/assets/icons/trayLoggedOutTemplate.png`,
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

try {
  if (process.platform === 'darwin') {
    // resize icons for macOS
    const size = { width: 16, height: 16 };
    TRAY_ICONS.LOGGED_OUT = TRAY_ICONS.LOGGED_OUT.resize(size);
    TRAY_ICONS.LOW_GAS = TRAY_ICONS.LOW_GAS.resize({ width: 16, height: 16 });
    TRAY_ICONS.PAUSED = TRAY_ICONS.PAUSED.resize({ width: 16, height: 16 });
    TRAY_ICONS.RUNNING = TRAY_ICONS.RUNNING.resize({ width: 16, height: 16 });
  }
} catch (e) {
  console.log('Error resizing tray icons', e);
}

module.exports = { TRAY_ICONS_PATHS, TRAY_ICONS };
