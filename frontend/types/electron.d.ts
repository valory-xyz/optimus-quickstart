import { ElectronStore } from './Electron';

interface ElectronAPI {
  setTrayIcon: (status) => (string, string) => void;
  closeApp: () => (string) => void;
  minimizeApp: () => (string) => void;
  store: {
    store: () => Promise<ElectronStore>;
    get: (key) => Promise<unknown>;
    set: (key, value) => Promise<unknown>;
    delete: (key) => Promise<unknown>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
