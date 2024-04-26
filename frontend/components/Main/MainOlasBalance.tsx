import { Flex, FlexProps } from 'antd';
import styled from 'styled-components';

import { balanceFormat } from '@/common-util/numberFormatters';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useWallet } from '@/hooks';

export const MainOlasBalance = () => {
  const { totalOlasBalance } = useWallet();
  return (
    <LineHeightFlex gap={7.5} align="end">
      <span className="balance-small">{UNICODE_SYMBOLS.OLAS}</span>
      <span className="balance">
        {totalOlasBalance === undefined
          ? '--'
          : balanceFormat(totalOlasBalance, 2)}
      </span>
      <span className="balance-small">OLAS</span>
    </LineHeightFlex>
  );
};

const LineHeightFlex = styled(Flex)<FlexProps>`
  line-height: 0.9;
`;
