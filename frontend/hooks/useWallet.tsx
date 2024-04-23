import { useContext } from 'react';

import { WalletContext } from '@/context/WalletProvider';

export const useWallet = () => {
  const {
    updateWalletBalances,
    updateWallets,
    wallets,
    walletBalances,
    totalEthBalance,
    totalOlasBalance,
  } = useContext(WalletContext);
  const update = () => updateWallets().then(updateWalletBalances);
  return {
    totalEthBalance,
    totalOlasBalance,
    update,
    updateWalletBalances,
    updateWallets,
    wallets,
    walletBalances,
  };
};
