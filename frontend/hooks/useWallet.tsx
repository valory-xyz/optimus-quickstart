import { useContext } from 'react';

import { WalletContext } from '@/context/WalletProvider';

export const useWallet = () => {
  const {
    wallets,
    masterEoaAddress: masterEaoAddress,
    masterSafeAddress,
    updateWallets,
  } = useContext(WalletContext);

  return { wallets, masterEaoAddress, masterSafeAddress, updateWallets };
};
