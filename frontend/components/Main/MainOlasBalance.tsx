import { Flex } from 'antd';

import { balanceFormat } from '@/common-util/numberFormatters';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useWallet } from '@/hooks';

export const MainOlasBalance = () => {
  const { totalOlasBalance } = useWallet();
  return (
    <Flex gap={5} align="end">
      <span className="balance-small">{UNICODE_SYMBOLS.OLAS}</span>
      <span className="balance">
        {totalOlasBalance === undefined
          ? '--'
          : balanceFormat(totalOlasBalance, 2)}
      </span>
      <span className="balance-small">OLAS</span>
    </Flex>
  );
};
