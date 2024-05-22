import { useContext } from 'react';

import { StoreContext } from '@/context/StoreProvider';

export const useStore = () => {
  const { storeState } = useContext(StoreContext);

  return { storeState };
};
