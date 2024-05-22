const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  setTrayIcon: (status) => ipcRenderer.send('tray', status),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  setAppHeight: (height) => ipcRenderer.send('set-height', height),
  notifyAgentRunning: () => ipcRenderer.send('notify-agent-running'),
});
