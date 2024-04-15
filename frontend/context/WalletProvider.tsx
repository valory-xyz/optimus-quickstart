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
import MulticallService from '@/service/Multicall';
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

    for (const wallet of wallets) {
      const { address, safe } = wallet;
      if (address && isAddress(address)) {
        walletsToCheck.push(address);
      }
      if (safe && isAddress(safe)) {
        walletsToCheck.push(safe);
      }
    }

    for (const serviceAddress of serviceAddresses) {
      if (serviceAddress && isAddress(serviceAddress)) {
        walletsToCheck.push(serviceAddress);
      }
    }

    const ethBalances = await MulticallService.getEthBalances(
      walletsToCheck,
      `${process.env.GNOSIS_RPC}`,
    );

    const balance = Object.values(ethBalances).reduce(
      (acc: number, value) => acc + value,
      0,
    );

    setBalance(balance);
  }, [serviceAddresses, wallets]);

  useInterval(
    () => updateWallets().then(updateBalance),
    wallets.length ? 5000 : null,
  );

  return (
    <WalletContext.Provider
      value={{ wallets, balance, updateWallets, updateBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
};
