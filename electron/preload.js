const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  setTrayIcon: (status) => ipcRenderer.send('tray', status),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  setAppHeight: (height) => ipcRenderer.send('set-height', height),
  showNotification: (title, description) =>
    ipcRenderer.send('show-notification', title, description),
});
