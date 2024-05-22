/* eslint-disable @typescript-eslint/no-explicit-any */
export type ElectronStore = Record<string, unknown>;

export type ElectronTrayIconStatus = 'low-gas' | 'running' | 'paused';

export type ElectronApi = {
  closeApp?: () => void;
  minimizeApp?: () => void;
  setTrayIcon?: (status: ElectronTrayIconStatus) => void;
  ipcRenderer?: {
    send?: (channel: string, data: unknown) => void;
    on?: (channel: string, func: (event: unknown, data: any) => void) => void;
    invoke?: (channel: string, data: unknown) => Promise<unknown>;
  };
  store?: {
    store?: () => Promise<ElectronStore>;
    get?: (key: string) => Promise<unknown>;
    set?: (key: string, value: unknown) => Promise<void>;
    delete?: (key: string) => Promise<void>;
  };
  setAppHeight?: (height: unknown) => void;
  notifyAgentRunning?: () => void;
};
