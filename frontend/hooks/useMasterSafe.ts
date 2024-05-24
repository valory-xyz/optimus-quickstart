import { useContext } from 'react';

import { MasterSafeContext } from '@/context/MasterSafeProvider';

export const useMasterSafe = () => {
  return useContext(MasterSafeContext);
};
