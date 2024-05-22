export type ElectronStore = Record<string, unknown>;

interface ElectronApi {
  closeApp: () => void;
  minimizeApp: () => void;
  setTrayIcon: (status) => void;
  ipcRenderer: {
    send: (channel, data) => void;
    on: (channel, func) => void;
    invoke: (channel, data) => Promise<unknown>;
  };
  store: {
    store: () => Promise<ElectronStore>;
    get: (key) => Promise<unknown>;
    set: (key, value) => Promise<void>;
    delete: (key) => Promise<void>;
  };
  setAppHeight: (height) => void;
  notifyAgentRunning: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronApi;
  }
}
