import { useContext } from 'react';

import { BalanceContext } from '@/context/BalanceProvider';

export const useBalance = () => {
  const {
    isLoaded,
    setIsLoaded,
    totalEthBalance,
    totalOlasBalance,
    wallets,
    walletBalances,
    updateBalances,
    setIsPaused,
  } = useContext(BalanceContext);

  return {
    isLoaded,
    setIsLoaded,
    totalEthBalance,
    totalOlasBalance,
    wallets,
    walletBalances,
    updateBalances,
    setIsPaused,
  };
};
