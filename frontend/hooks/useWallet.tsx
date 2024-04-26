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

  const updateWalletState = async () =>
    await updateWallets().then(updateWalletBalances);

  return {
    totalEthBalance,
    totalOlasBalance,
    updateWalletState,
    updateWalletBalances,
    updateWallets,
    wallets,
    walletBalances,
  };
};
