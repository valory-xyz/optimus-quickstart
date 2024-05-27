import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { Wallet } from '@/client';
import { WalletService } from '@/service/Wallet';
import { Address } from '@/types';

import { OnlineStatusContext } from './OnlineStatusProvider';

export const WalletContext = createContext<{
  masterEoaAddress?: Address;
  masterSafeAddress?: Address;
  wallets?: Wallet[];
  updateWallets: () => Promise<void>;
}>({
  masterEoaAddress: undefined,
  masterSafeAddress: undefined,
  wallets: undefined,
  updateWallets: async () => {},
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { isOnline } = useContext(OnlineStatusContext);

  const [wallets, setWallets] = useState<Wallet[]>();

  const masterEoaAddress: Address | undefined = wallets?.[0]?.address;
  const masterSafeAddress: Address | undefined = wallets?.[0]?.safe;

  const updateWallets = async () => {
    const wallets = await WalletService.getWallets();
    if (!wallets) return;
    setWallets(wallets);
  };

  useInterval(updateWallets, isOnline ? 5000 : null);

  return (
    <WalletContext.Provider
      value={{
        masterEoaAddress,
        masterSafeAddress,
        wallets,
        updateWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
