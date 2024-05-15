import { useContext } from 'react';

import { BalanceContext } from '@/context/BalanceProvider';

export const useBalance = () => {
  const {
    isLoaded,
    setIsLoaded,
    isBalanceLoaded,
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
    isBalanceLoaded,
    totalEthBalance,
    totalOlasBalance,
    wallets,
    walletBalances,
    updateBalances,
    setIsPaused,
  };
};
