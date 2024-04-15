import { useContext } from 'react';

import { WalletContext } from '@/context/WalletProvider';

export const useWallet = () => {
  const { updateBalance, updateWallets, wallets, balance } =
    useContext(WalletContext);
  const update = () => updateWallets().then(updateBalance);
  return {
    balance,
    update,
    updateBalance,
    updateWallets,
    wallets,
  };
};
