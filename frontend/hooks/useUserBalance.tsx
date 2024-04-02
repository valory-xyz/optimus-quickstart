import { useContext } from 'react';

import { WalletContext } from '@/context/WalletProvider';

export const useUserBalance = () => {
  return useContext(WalletContext);
};
