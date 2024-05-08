const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  setTrayIcon: (status) => ipcRenderer.send('tray', status),
});
