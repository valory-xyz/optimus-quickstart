import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Contract as MulticallContract } from 'ethers-multicall';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { SERVICE_REGISTRY_TOKEN_UTILITY_ABI } from '@/abi/serviceRegistryTokenUtility';
import { Chain, Wallet } from '@/client';
import { SERVICE_REGISTRY_TOKEN_UTILITY_CONTRACT } from '@/constants';
import { gnosisMulticallProvider } from '@/constants/providers';
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
import { RewardContext } from './RewardProvider';

export const BalanceContext = createContext<{
  isLoaded: boolean;
  setIsLoaded: Dispatch<SetStateAction<boolean>>;
  olasBondBalance?: number;
  olasDepositBalance?: number;
  totalEthBalance?: number;
  totalOlasBalance?: number;
  wallets: Wallet[];
  walletBalances: WalletAddressNumberRecord;
  updateBalances: () => Promise<void>;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
}>({
  isLoaded: false,
  setIsLoaded: () => {},
  olasBondBalance: undefined,
  olasDepositBalance: undefined,
  totalEthBalance: undefined,
  totalOlasBalance: undefined,
  wallets: [],
  walletBalances: {},
  updateBalances: async () => {},
  setIsPaused: () => {},
});

export const BalanceProvider = ({ children }: PropsWithChildren) => {
  const { services, serviceAddresses } = useContext(ServicesContext);
  const { optimisticRewardsEarnedForEpoch } = useContext(RewardContext);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [olasDepositBalance, setOlasDepositBalance] = useState<number>();
  const [olasBondBalance, setOlasBondBalance] = useState<number>();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletBalances, setWalletBalances] =
    useState<WalletAddressNumberRecord>({});

  const totalEthBalance: number | undefined = useMemo(() => {
    if (!isLoaded) return;
    return Object.values(walletBalances).reduce(
      (acc: number, walletBalance) => acc + walletBalance.ETH,
      0,
    );
  }, [isLoaded, walletBalances]);

  const totalOlasBalance: number | undefined = useMemo(() => {
    if (!isLoaded) return;
    const sumWalletBalances = Object.values(walletBalances).reduce(
      (acc: number, walletBalance) => acc + walletBalance.OLAS,
      0,
    );

    return (
      sumWalletBalances +
      (olasDepositBalance ?? 0) +
      (olasBondBalance ?? 0) +
      (optimisticRewardsEarnedForEpoch ?? 0)
    );
  }, [
    isLoaded,
    olasBondBalance,
    olasDepositBalance,
    optimisticRewardsEarnedForEpoch,
    walletBalances,
  ]);

  const updateBalances = useCallback(async (): Promise<void> => {
    try {
      const wallets = await getWallets();

      if (!wallets) return;

      const walletAddresses = getWalletAddresses(wallets, serviceAddresses);
      const walletBalances = await getWalletBalances(walletAddresses);

      if (!walletBalances) return;

      if (services?.[0]?.chain_data.token) {
        const serviceRegistryBalances = await getServiceRegistryBalances(
          wallets[0].address,
          services[0].chain_data.token,
        );
        if (serviceRegistryBalances) {
          setOlasDepositBalance(serviceRegistryBalances.depositValue);
          setOlasBondBalance(serviceRegistryBalances.bondValue);
        }
      }

      setWallets(wallets);
      setWalletBalances(walletBalances);
      setIsLoaded(true);
    } catch (error) {
      console.error(error);
    }
  }, [serviceAddresses, services]);

  useInterval(
    () => {
      updateBalances();
    },
    isPaused ? null : 5000,
  );

  return (
    <BalanceContext.Provider
      value={{
        isLoaded,
        setIsLoaded,
        olasBondBalance,
        olasDepositBalance,
        totalEthBalance,
        totalOlasBalance,
        wallets,
        walletBalances,
        updateBalances,
        setIsPaused,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const getEthBalances = async (
  walletAddresses: Address[],
): Promise<AddressNumberRecord | undefined> => {
  const rpcIsValid = await EthersService.checkRpc(`${process.env.GNOSIS_RPC}`);
  if (!rpcIsValid) return;

  const ethBalances = await MulticallService.getEthBalances(walletAddresses);

  return ethBalances;
};

export const getOlasBalances = async (
  walletAddresses: Address[],
): Promise<AddressNumberRecord | undefined> => {
  const rpcIsValid = await EthersService.checkRpc(`${process.env.GNOSIS_RPC}`);
  if (!rpcIsValid) return;

  const olasBalances = await MulticallService.getErc20Balances(
    walletAddresses,
    TOKENS.gnosis.OLAS,
  );

  return olasBalances;
};

export const getWallets = async (): Promise<Wallet[]> =>
  WalletService.getWallets();

export const getWalletAddresses = (
  wallets: Wallet[],
  serviceAddresses: Address[],
): Address[] => {
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
};

export const getWalletBalances = async (
  walletAddresses: Address[],
): Promise<WalletAddressNumberRecord | undefined> => {
  const [ethBalances, olasBalances] = await Promise.all([
    getEthBalances(walletAddresses),
    getOlasBalances(walletAddresses),
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

  return tempWalletBalances;
};

export const getServiceRegistryBalances = async (
  masterEoa: Address,
  serviceId: number,
): Promise<{ bondValue: number; depositValue: number } | undefined> => {
  if (serviceId === undefined || serviceId < 0) return;

  const serviceRegistryL2Contract = new MulticallContract(
    SERVICE_REGISTRY_TOKEN_UTILITY_CONTRACT[Chain.GNOSIS],
    SERVICE_REGISTRY_TOKEN_UTILITY_ABI,
  );

  const contractCalls = [
    serviceRegistryL2Contract.getOperatorBalance(masterEoa, serviceId),
    serviceRegistryL2Contract.mapServiceIdTokenDeposit(serviceId),
  ];

  try {
    await gnosisMulticallProvider.init();

    const [operatorBalanceResponse, serviceIdTokenDepositResponse] =
      await gnosisMulticallProvider.all(contractCalls);

    const [operatorBalance, serviceIdTokenDeposit] = [
      parseFloat(ethers.utils.formatUnits(operatorBalanceResponse, 18)),
      parseFloat(
        ethers.utils.formatUnits(serviceIdTokenDepositResponse[1], 18),
      ),
    ];

    return {
      bondValue: operatorBalance,
      depositValue: serviceIdTokenDeposit,
    };
  } catch (error) {
    console.error(error);
  }
};
