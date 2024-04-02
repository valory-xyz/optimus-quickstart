import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { Wallet } from '@/client';
import { EthersService } from '@/service';
import { WalletService } from '@/service/Wallet';

export const WalletContext = createContext<{
  balance: number;
}>({
  balance: 0,
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balance, setBalance] = useState(0);

  const updateBalance = useCallback(async () => {
    const balancePromises = [];
    for (const wallet of wallets) {
      balancePromises.push(
        EthersService.getEthBalance(wallet.address, 'http://localhost:8545'),
        EthersService.getEthBalance(wallet.safe, 'http://localhost:8545'),
      );
    }
    Promise.allSettled(balancePromises)
      .then((results) =>
        results.reduce(
          (a: number, b: PromiseSettledResult<number>) =>
            b.status === 'fulfilled' ? a + b.value : a,
          0,
        ),
      )
      .then(setBalance);
  }, [wallets]);

  useInterval(() => {
    updateBalance()
      .then((balance) => console.log('Balance:', balance))
      .catch(() => console.error('Failed to get balance'));
  }, 5000);

  useEffect(() => {
    WalletService.getWallets()
      .then(setWallets)
      .catch(() => console.error('Failed to get wallets'));
  }, []);

  return (
    <WalletContext.Provider value={{ balance }}>
      {children}
    </WalletContext.Provider>
  );
};
