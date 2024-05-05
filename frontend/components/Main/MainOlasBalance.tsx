import { Flex } from 'antd';

import { balanceFormat } from '@/common-util/numberFormatters';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useWallet } from '@/hooks';

export const MainOlasBalance = () => {
  const { totalOlasBalance } = useWallet();
  return (
    <Flex align="end" gap={5}>
      <span className="balance-symbol">{UNICODE_SYMBOLS.OLAS}</span>
      <span className="balance">
        {totalOlasBalance === undefined
          ? '--'
          : balanceFormat(totalOlasBalance, 2)}
      </span>
      <span className="balance-currency">OLAS</span>
    </Flex>
  );
};
