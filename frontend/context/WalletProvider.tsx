import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { Wallet } from '@/client';
import { EthersService } from '@/service';
import MulticallService from '@/service/Multicall';
import { WalletService } from '@/service/Wallet';

import { ServicesContext } from '.';

export const WalletContext = createContext<{
  wallets: Wallet[];
  balance: number | undefined;
  updateWallets: () => Promise<void>;
  updateBalance: () => void;
}>({
  wallets: [],
  balance: undefined,
  updateWallets: async () => {},
  updateBalance: () => {},
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { serviceAddresses } = useContext(ServicesContext);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balance, setBalance] = useState<number>();

  const updateWallets = useCallback(
    async () => WalletService.getWallets().then(setWallets),
    [],
  );

  const updateBalance = useCallback(async () => {
    const isRpcActive = await EthersService.checkRpc('https://localhost:8545');
    if (!isRpcActive) return;
    const multicallBalances = await MulticallService.getEthBalances(
      serviceAddresses,
      'http://localhost:8545',
    );

    setBalance(
      Object.values(multicallBalances).reduce(
        (acc, balance) => acc + balance,
        0,
      ),
    );
  }, [serviceAddresses]);

  useInterval(() => updateBalance(), wallets.length ? 5000 : null);

  return (
    <WalletContext.Provider
      value={{ wallets, balance, updateWallets, updateBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
};
