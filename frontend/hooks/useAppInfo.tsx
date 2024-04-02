import { useContext } from 'react';

import { AppInfoContext } from '@/context';
import { Address } from '@/types';

export const useAppInfo = () => {
  const { appInfo } = useContext(AppInfoContext);

  const userPublicKey: Address | undefined = appInfo?.account?.key;

  return {
    userPublicKey,
  };
};
