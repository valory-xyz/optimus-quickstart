import { isAddress } from 'ethers/lib/utils';
import { isEmpty } from 'lodash';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { Wallet } from '@/client';
import { TOKENS } from '@/constants/tokens';
import { Token } from '@/enums/Token';
import { EthersService } from '@/service';
import MulticallService from '@/service/Multicall';
import { WalletService } from '@/service/Wallet';
import {
  Address,
  AddressNumberRecord,
  WalletAddressNumberRecord,
} from '@/types';

import { ServicesContext } from '.';

export const WalletContext = createContext<{
  wallets: Wallet[];
  walletBalances: WalletAddressNumberRecord;
  totalEthBalance?: number;
  totalOlasBalance?: number;
  updateWallets: () => Promise<void>;
  updateWalletBalances: () => Promise<void>;
}>({
  wallets: [],
  walletBalances: {},
  totalEthBalance: undefined,
  totalOlasBalance: undefined,
  updateWallets: async () => {},
  updateWalletBalances: async () => {},
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { serviceAddresses } = useContext(ServicesContext);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletBalances, setWalletBalances] =
    useState<WalletAddressNumberRecord>({});

  const walletAddresses: Address[] = useMemo(() => {
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
    return walletsToCheck;
  }, [serviceAddresses, wallets]);

  const totalEthBalance: number | undefined = useMemo(() => {
    if (!walletBalances) return;
    if (isEmpty(walletBalances)) return;
    return Object.values(walletBalances).reduce(
      (acc: number, walletBalance) => acc + walletBalance.ETH,
      0,
    );
  }, [walletBalances]);

  const totalOlasBalance: number | undefined = useMemo(() => {
    if (!walletBalances) return;
    if (isEmpty(walletBalances)) return;
    return Object.values(walletBalances).reduce(
      (acc: number, walletBalance) => acc + walletBalance.OLAS,
      0,
    );
  }, [walletBalances]);

  const getEthBalances = useCallback(async (): Promise<
    AddressNumberRecord | undefined
  > => {
    const rpcIsValid = await EthersService.checkRpc(
      `${process.env.GNOSIS_RPC}`,
    );
    if (!rpcIsValid) return;

    const ethBalances = await MulticallService.getEthBalances(
      walletAddresses,
      `${process.env.GNOSIS_RPC}`,
    );

    return ethBalances;
  }, [walletAddresses]);

  const getOlasBalances = useCallback(async (): Promise<
    AddressNumberRecord | undefined
  > => {
    const rpcIsValid = await EthersService.checkRpc(
      `${process.env.GNOSIS_RPC}`,
    );
    if (!rpcIsValid) return;

    const olasBalances = await MulticallService.getErc20Balances(
      walletAddresses,
      `${process.env.GNOSIS_RPC}`,
      TOKENS.gnosis.OLAS,
    );

    return olasBalances;
  }, [walletAddresses]);

  const updateWallets = useCallback(
    async () =>
      WalletService.getWallets().then((wallets) => setWallets(wallets)),
    [],
  );

  const updateWalletBalances = useCallback(async () => {
    const [ethBalances, olasBalances] = await Promise.all([
      getEthBalances(),
      getOlasBalances(),
    ]);

    if (!ethBalances) return;
    if (!olasBalances) return;

    const tempWalletBalances: WalletAddressNumberRecord = {};
    for (const [address, balance] of Object.entries(ethBalances)) {
      tempWalletBalances[address as Address] = {
        [Token.ETH]: balance,
        [Token.OLAS]: olasBalances[address as Address],
      };
    }

    setWalletBalances(tempWalletBalances);
  }, [getEthBalances, getOlasBalances]);

  useInterval(() => updateWalletBalances(), 5000);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        walletBalances,
        totalEthBalance,
        totalOlasBalance,
        updateWallets,
        updateWalletBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
