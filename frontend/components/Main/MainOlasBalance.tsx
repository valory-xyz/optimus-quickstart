import { Spin } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';

import { balanceFormat } from '@/common-util/numberFormatters';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';

import { CardSection } from '../styled/CardSection';

const Loader = styled.div`
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding-top: 24px;
`;

export const MainOlasBalance = () => {
  const { isBalanceLoaded, totalOlasBalance } = useBalance();

  const balance = useMemo(() => {
    if (!isBalanceLoaded)
      return (
        <Loader>
          <Spin />
        </Loader>
      );

    if (totalOlasBalance === undefined) return '--';

    return balanceFormat(totalOlasBalance, 2);
  }, [isBalanceLoaded, totalOlasBalance]);

  return (
    <CardSection align="end" gap={5} borderTop borderBottom>
      <span className="balance-symbol">{UNICODE_SYMBOLS.OLAS}</span>
      <span className="balance">{balance}</span>
      <span className="balance-currency">OLAS</span>
    </CardSection>
  );
};
