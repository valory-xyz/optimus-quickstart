import { createContext, PropsWithChildren, useEffect, useState } from 'react';

import type { ElectronStore } from '@/types';

export const StoreContext = createContext<{ storeState?: ElectronStore }>({
  storeState: undefined,
});

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const [storeState, setStoreState] = useState<ElectronStore>();

  const setupStore = async () => {
    const store: ElectronStore = await window.electronAPI.store.store();
    setStoreState(store);

    // ipcRenderer.on('store-change', (_event, data: ElectronStore) => {
    // setStoreState(data);
    // });
  };

  useEffect(() => {
    if (!storeState) setupStore().catch(console.error);
  }, [storeState]);

  return (
    <StoreContext.Provider value={{ storeState }}>
      {children}
    </StoreContext.Provider>
  );
};
