import { useContext } from 'react';

import { WalletContext } from '@/context/WalletProvider';

export const useWallet = () => {
  const { wallets, masterEoaAddress, masterSafeAddress, updateWallets } =
    useContext(WalletContext);

  return {
    wallets,
    masterEoaAddress,
    masterSafeAddress,
    updateWallets,
  };
};
