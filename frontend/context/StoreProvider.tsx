import { createContext, PropsWithChildren, useEffect, useState } from 'react';

import { ElectronApiService } from '@/service';
import type { ElectronStore } from '@/types';

export const StoreContext = createContext<{ storeState?: ElectronStore }>({
  storeState: undefined,
});

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const [storeState, setStoreState] = useState<ElectronStore>();

  const setupStore = async () => {
    const store = await ElectronApiService?.store.store();
    if (store) setStoreState(store);

    ElectronApiService?.ipcRenderer.on(
      'store-change',
      (_event: unknown, data: ElectronStore) => {
        setStoreState(data);
      },
    );
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
