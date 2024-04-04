import { isAddress } from 'ethers/lib/utils';
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
import { WalletService } from '@/service/Wallet';
import { Address } from '@/types';

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
    if ((await EthersService.checkRpc(`${process.env.GNOSIS_RPC}`)) === false)
      return;

    const walletsToCheck: Address[] = [];

    for (const wallet of wallets)
      if (wallet.address && isAddress(wallet.address))
        walletsToCheck.push(wallet.address);

    for (const serviceAddress of serviceAddresses)
      if (serviceAddress && isAddress(serviceAddress))
        walletsToCheck.push(serviceAddress);

    const balancePromises = walletsToCheck.map((address) =>
      EthersService.getEthBalance(address, `${process.env.GNOSIS_RPC}`),
    );

    const settledBalances = await Promise.allSettled(balancePromises);

    const balance = settledBalances.reduce((acc: number, promise) => {
      if (promise.status === 'fulfilled') {
        return acc + promise.value;
      }
      return acc;
    }, 0);

    setBalance(balance);
  }, [serviceAddresses, wallets]);

  useInterval(() => updateBalance(), wallets.length ? 5000 : null);

  return (
    <WalletContext.Provider
      value={{ wallets, balance, updateWallets, updateBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
};
