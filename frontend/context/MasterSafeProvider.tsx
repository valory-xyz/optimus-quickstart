import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

import { GnosisSafeService } from '@/service/GnosisSafe';
import { Address } from '@/types';

import { BalanceContext } from '.';

export const MasterSafeContext = createContext<{
  backupSafeAddress?: Address;
  masterSafeAddress?: Address;
  masterEoaAddress?: Address;
  masterSafeOwners?: Address[];
  updateOwners?: () => Promise<void>;
}>({
  backupSafeAddress: undefined,
  masterSafeAddress: undefined,
  masterEoaAddress: undefined,
  masterSafeOwners: undefined,
  updateOwners: async () => {},
});

export const MasterSafeProvider = ({ children }: PropsWithChildren) => {
  const { wallets } = useContext(BalanceContext);

  const [masterSafeOwners, setMasterSafeOwners] = useState<Address[]>();

  const masterSafeAddress = useMemo<Address | undefined>(() => {
    if (!wallets) return;
    if (!wallets.length) return;
    return wallets[0].safe;
  }, [wallets]);

  const masterEoaAddress = useMemo<Address | undefined>(() => {
    if (!wallets) return;
    if (!wallets.length) return;
    return wallets[0].address;
  }, [wallets]);

  const backupSafeAddress = useMemo<Address | undefined>(() => {
    if (!masterEoaAddress) return;
    if (!masterSafeOwners) return;
    if (!masterSafeOwners.length) return;
    if (!masterSafeOwners.includes(masterEoaAddress)) {
      console.error('Safe not owned by master EOA');
      return;
    }

    const currentBackupAddress = masterSafeOwners.find(
      (address) => address !== masterEoaAddress,
    );

    return currentBackupAddress;
  }, [masterEoaAddress, masterSafeOwners]);

  const updateOwners = async () => {
    if (!masterSafeAddress) return;
    const safeSigners = await GnosisSafeService.getOwners({
      address: masterSafeAddress,
    });
    setMasterSafeOwners(safeSigners);
  };

  return (
    <MasterSafeContext.Provider
      value={{
        backupSafeAddress,
        masterSafeOwners,
        masterSafeAddress,
        masterEoaAddress,
        updateOwners,
      }}
    >
      {children}
    </MasterSafeContext.Provider>
  );
};
