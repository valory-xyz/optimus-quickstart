import { balanceFormat } from '@/common-util/numberFormatters';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';

import { CardSection } from '../styled/CardSection';

export const MainOlasBalance = () => {
  const { totalOlasBalance } = useBalance();
  return (
    <CardSection align="end" gap={5} border>
      <span className="balance-symbol">{UNICODE_SYMBOLS.OLAS}</span>
      <span className="balance">
        {totalOlasBalance === undefined
          ? '--'
          : balanceFormat(totalOlasBalance, 2)}
      </span>
      <span className="balance-currency">OLAS</span>
    </CardSection>
  );
};
