import { ArrowUpOutlined, QuestionCircleTwoTone } from '@ant-design/icons';
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
  background-color: ${COLOR.ORANGE};
`;

const BalanceStatus = () => {
  const { isBalanceLoaded, totalEthBalance } = useBalance();

  const status = useMemo(() => {
    if (!totalEthBalance || totalEthBalance === 0) {
      return { statusName: 'Empty', StatusComponent: EmptyDot };
    }

    if (totalEthBalance < 0.1) {
      return { statusName: 'Low', StatusComponent: LowDot };
    }

    return { statusName: 'Fine', StatusComponent: FineDot };
  }, [totalEthBalance]);

  if (!isBalanceLoaded) {
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

const TooltipContent = styled.div`
  font-size: 77.5%;
  a {
    margin-top: 6px;
    display: inline-block;
  }
`;

export const MainGasBalance = () => {
  return (
    <CardSection justify="space-between" border>
      <Text>
        Gas and trading balance&nbsp;
        <Tooltip
          title={
            <TooltipContent>
              Your agent uses this balance to pay for transactions and other
              trading activity on-chain.
              <br />
              {/* TODO: ask link */}
              <a href="https://docs.openlaw.io/olas/olas-eth" target="_blank">
                Track activity on blockchain explorer{' '}
                <ArrowUpOutlined style={{ rotate: '45deg' }} />
              </a>
            </TooltipContent>
          }
        >
          <QuestionCircleTwoTone />
        </Tooltip>
      </Text>

      <Text strong>
        <BalanceStatus />
      </Text>
    </CardSection>
  );
};
