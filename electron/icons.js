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

/**
 * frame = true & transparent = true & height = 750
 * - Unable to see the frame (ie. close, minimize, maximize buttons)
 *
 * frame = true & transparent = true & height = null
 * - Unable to see the frame (ie. close, minimize, maximize buttons)
 *
 * frame = false & transparent = true & height = 750
 * - Same as above
 *
 * frame = false & transparent = false & height = 750
 * - NA
 *
 * frame = true & transparent = false & height = 750
 * - Able to see the frame (ie. close, minimize, maximize buttons)
 * - BUT the background is white and takes up the whole window (ie. no transparency and full height)
 */
