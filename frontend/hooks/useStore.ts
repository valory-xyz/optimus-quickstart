import { useContext } from 'react';

import { StoreContext } from '@/context/StoreProvider';

export const useStore = () => useContext(StoreContext);
