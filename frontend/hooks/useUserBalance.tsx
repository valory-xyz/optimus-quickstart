import { useContext } from 'react';

import { UserBalanceContext } from '@/context/UserBalanceProvider';

export const useUserBalance = () => {
  return useContext(UserBalanceContext);
};
