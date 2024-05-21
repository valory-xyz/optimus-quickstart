import { useContext } from 'react';

import { StoreContext } from '@/context/StoreProvider';

export const useStore = () => {
  const { storeState } = useContext(StoreContext);

  const storeIpc = window.electronAPI.store;

  return { storeState, storeIpc };
};
