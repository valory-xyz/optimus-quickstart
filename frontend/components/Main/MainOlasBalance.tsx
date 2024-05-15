import { Skeleton } from 'antd';
import { useMemo } from 'react';

import { balanceFormat } from '@/common-util/numberFormatters';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';

import { CardSection } from '../styled/CardSection';

export const MainOlasBalance = () => {
  const { isBalanceLoaded, totalOlasBalance } = useBalance();

  const balance = useMemo(() => {
    if (totalOlasBalance === undefined) return '--';
    return balanceFormat(totalOlasBalance, 2);
  }, [totalOlasBalance]);

  return (
    <CardSection align="end" gap={5} borderTop borderBottom>
      {isBalanceLoaded ? (
        <>
          <span className="balance-symbol">{UNICODE_SYMBOLS.OLAS}</span>
          <span className="balance">{balance}</span>
          <span className="balance-currency">OLAS</span>
        </>
      ) : (
        <Skeleton.Input active size="large" style={{ margin: '4px 0' }} />
      )}
    </CardSection>
  );
};
