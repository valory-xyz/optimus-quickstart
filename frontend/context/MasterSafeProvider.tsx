import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { Address } from '@/types';

import { BalanceContext } from '.';

export const MasterSafeContext = createContext<{
  isSafeSetup: boolean | undefined;
  safeSigners: Address[];
}>({
  isSafeSetup: undefined,
  safeSigners: [],
});

export const MasterSafeProvider = ({ children }: PropsWithChildren) => {
  const { wallets } = useContext(BalanceContext);
  const [isSafeSetup, setIsSafeSetup] = useState<boolean>();
  const [safeSigners, setSafeSigners] = useState<Address[]>([]);

  const masterSafe = []; // todo: get master safe address

  return (
    <MasterSafeContext.Provider value={{ isSafeSetup, safeSigners }}>
      {children}
    </MasterSafeContext.Provider>
  );
};
