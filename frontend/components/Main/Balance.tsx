import { Flex } from 'antd';

import { useWallet } from '@/hooks';

export const Balance = () => {
  const { balance } = useWallet();
  return (
    <Flex gap={5} align="end">
      <span className="balance-small">☴</span>
      <span className="balance">
        {balance === undefined ? '--' : balance.toFixed(2)}
      </span>
      <span className="balance-small">OLAS</span>
    </Flex>
  );
};
