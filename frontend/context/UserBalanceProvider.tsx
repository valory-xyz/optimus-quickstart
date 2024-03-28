import { createContext, PropsWithChildren, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { useAppInfo } from '@/hooks';
import { EthersService } from '@/service';

export const UserBalanceContext = createContext<{
  balance: number;
}>({
  balance: 0,
});

export const UserBalanceProvider = ({ children }: PropsWithChildren) => {
  const { userPublicKey } = useAppInfo();
  const [balance, setBalance] = useState<number>(0);

  const updateBalance = async () => {
    const isRpcValid = await EthersService.checkRpc('http://localhost:8545');
    if (userPublicKey && isRpcValid)
      EthersService.getEthBalance(userPublicKey, 'http://localhost:8545').then(
        (res) => setBalance(res),
      );
  };

  useInterval(() => {
    updateBalance();
  }, 5000);

  return (
    <UserBalanceContext.Provider value={{ balance }}>
      {children}
    </UserBalanceContext.Provider>
  );
};
