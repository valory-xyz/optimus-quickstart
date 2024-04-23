import { Alert, Flex } from 'antd';
import { ReactNode, useMemo } from 'react';

import { SERVICE_TEMPLATES } from '@/constants';
import { useWallet } from '@/hooks';

export const MainNeedsFunds = () => {
  const serviceTemplate = SERVICE_TEMPLATES[0];
  const { walletBalances, totalEthBalance, totalOlasBalance } = useWallet();

  const isVisible = useMemo(() => {}, []);

  const message: ReactNode = useMemo(
    () => (
      <Flex vertical>
        <strong>Your agent needs funds</strong>
        <span>To run your agent, add at least: </span>
        <ul></ul>
      </Flex>
    ),
    [],
  );

  return <Alert message={message} type="info" />;
};
