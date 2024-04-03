import { createContext, PropsWithChildren, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { useAppInfo } from '@/hooks';
import { EthersService } from '@/service';
import { env } from "process";

const RPC = env.DEV_RPC ? env.DEV_RPC : "https://rpc.gnosischain.com";

export const UserBalanceContext = createContext<{
  balance: number;
}>({
  balance: 0,
});

export const UserBalanceProvider = ({ children }: PropsWithChildren) => {
  const { userPublicKey } = useAppInfo();
  const [balance, setBalance] = useState<number>(0);

  const updateBalance = async () => {
    const isRpcValid = await EthersService.checkRpc(RPC);
    if (userPublicKey && isRpcValid)
      EthersService.getEthBalance(userPublicKey, RPC).then(
        (res) => setBalance(res)
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
