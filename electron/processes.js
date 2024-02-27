const psTree = require('ps-tree');
const { exec } = require('child_process');

const unixKillCommand = 'kill -9';
const windowsKillCommand = 'taskkill /F /PID';

function killProcessAndChildren(pid, isWindows = false) {
  return new Promise((resolve, reject) => {
    psTree(pid, (err, children) => {
      if (err) {
        reject(err);
        return;
      }

      // Array of PIDs to kill, starting with the children
      const pidsToKill = children.map((p) => p.PID);
      pidsToKill.push(pid); // Also kill the main process

      const killCommand = isWindows ? windowsKillCommand : unixKillCommand;
      const joinedCommand = pidsToKill
        .map((pid) => `${killCommand} ${pid}`)
        .join('; '); // Separate commands with a semicolon, so they run in sequence even if one fails. Also works on Windows.

      exec(joinedCommand, (err) => {
        if (err?.message?.includes('No such process')) {
          return; // Ignore errors for processes that are already dead
        }
        reject(err);
      });

      resolve();
    });
  });
}

module.exports = { killProcessAndChildren };
