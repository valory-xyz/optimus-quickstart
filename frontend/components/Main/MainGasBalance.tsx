import { QuestionCircleTwoTone } from '@ant-design/icons';
import { Spin, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';

import { COLOR } from '@/constants';
import { useBalance } from '@/hooks';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

const Dot = styled.span`
  position: relative;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid #ffffff;
  box-shadow:
    rgb(0 0 0 / 7%) 0px 2px 4px 0px,
    rgb(0 0 0 / 3%) 0px 0px 4px 2px;
`;
const EmptyDot = styled(Dot)`
  background-color: ${COLOR.RED};
`;
const FineDot = styled(Dot)`
  background-color: ${COLOR.GREEN_2};
`;
const LowDot = styled(Dot)`
  background-color: ${COLOR.PURPLE};
`;

const BalanceStatus = () => {
  const { isLoaded, totalEthBalance } = useBalance();

  const status = useMemo(() => {
    if (!totalEthBalance || totalEthBalance === 0) {
      return { statusName: 'Empty', StatusComponent: EmptyDot };
    }

    if (totalEthBalance < 0.1) {
      return { statusName: 'Low', StatusComponent: LowDot };
    }

    return { statusName: 'Fine', StatusComponent: FineDot };
  }, [totalEthBalance]);

  if (!isLoaded) {
    return <Spin />;
  }

  const { statusName, StatusComponent } = status;
  return (
    <>
      <StatusComponent />
      <Text>{statusName}</Text>
    </>
  );
};

export const MainGasBalance = () => {
  return (
    <CardSection justify="space-between" border>
      <Text>
        Gas and trading balance&nbsp;
        <Tooltip title="Gas balance is the amount of XDAI you have to pay for transactions.">
          <QuestionCircleTwoTone />
        </Tooltip>
      </Text>

      <Text strong>
        <BalanceStatus />
      </Text>
    </CardSection>
  );
};
