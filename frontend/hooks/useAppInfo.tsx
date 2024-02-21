import { AppInfoContext } from '@/context';
import { Address } from '@/types';
import { useContext } from 'react';

export const useAppInfo = () => {
  const { appInfo } = useContext(AppInfoContext);

  const userPublicKey: Address | undefined = appInfo?.account.key;

  return {
    userPublicKey,
  };
};
