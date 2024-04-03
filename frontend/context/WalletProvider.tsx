import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { Wallet } from '@/client';
import { EthersService } from '@/service';
import { WalletService } from '@/service/Wallet';

export const WalletContext = createContext<{
  wallets: Wallet[];
  balance: number;
  updateWallets: () => Promise<void>;
  updateBalance: () => void;
}>({
  wallets: [],
  balance: 0,
  updateWallets: async () => {},
  updateBalance: () => {},
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balance, setBalance] = useState(0);

  const updateWallets = useCallback(
    async () => WalletService.getWallets().then(setWallets),
    [],
  );

  const updateBalance = useCallback(async () => {
    const balancePromises = [];
    for (const wallet of wallets) {
      balancePromises.push(
        EthersService.getEthBalance(wallet.address, 'http://localhost:8545'),
        EthersService.getEthBalance(wallet.safe, 'http://localhost:8545'),
      );
    }

    return Promise.allSettled(balancePromises)
      .then((results) =>
        results.reduce(
          (a: number, b: PromiseSettledResult<number>) =>
            b.status === 'fulfilled' ? a + b.value : a,
          0,
        ),
      )
      .then(setBalance);
  }, [wallets]);

  useInterval(() => updateBalance(), wallets.length ? 5000 : null);

  return (
    <WalletContext.Provider
      value={{ wallets, balance, updateWallets, updateBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
};
