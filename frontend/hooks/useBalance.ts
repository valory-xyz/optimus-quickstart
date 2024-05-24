import { useContext } from 'react';

import { BalanceContext } from '@/context/BalanceProvider';

export const useBalance = () => {
  const {
    isLoaded,
    setIsLoaded,
    isBalanceLoaded,
    eoaBalance,
    safeBalance,
    totalEthBalance,
    totalOlasBalance,
    wallets,
    walletBalances,
    updateBalances,
    setIsPaused,
    totalOlasStakedBalance,
  } = useContext(BalanceContext);

  return {
    isLoaded,
    setIsLoaded,
    isBalanceLoaded,
    eoaBalance,
    safeBalance,
    totalEthBalance,
    totalOlasBalance,
    wallets,
    walletBalances,
    updateBalances,
    setIsPaused,
    totalOlasStakedBalance,
  };
};
