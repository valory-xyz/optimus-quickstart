import { Col, Flex, Row, Skeleton, Tag, Typography } from 'antd';
import { useEffect } from 'react';
import styled from 'styled-components';

import { balanceFormat } from '@/common-util';
import { COLOR } from '@/constants';
import { useBalance } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useReward } from '@/hooks/useReward';

const { Text } = Typography;

const RewardsRow = styled(Row)`
  margin: 0 -24px;
  > .ant-col {
    padding: 24px;
    border-right: 1px solid ${COLOR.BORDER_GRAY};
  }
`;

// TODO: Replace with real data
const isStakingInfoLoaded = false;
const isStaked = false;

const DisplayRewards = () => {
  const { availableRewardsForEpochEther, isEligibleForRewards } = useReward();
  const { isBalanceLoaded, totalOlasStakedBalance } = useBalance();

  return (
    <RewardsRow>
      <Col span={12}>
        <Flex vertical gap={4} align="flex-start">
          <Text>Staking rewards today</Text>
          {isBalanceLoaded ? (
            <>
              <Text strong style={{ fontSize: 20 }}>
                {balanceFormat(availableRewardsForEpochEther, 2)} OLAS
              </Text>
              {isEligibleForRewards ? (
                <Tag color="success">Earned</Tag>
              ) : (
                <Tag color="processing">Not yet earned</Tag>
              )}
            </>
          ) : (
            <Flex vertical gap={8}>
              <Skeleton.Button active size="small" style={{ width: 92 }} />
              <Skeleton.Button active size="small" style={{ width: 92 }} />
            </Flex>
          )}
        </Flex>
      </Col>

      <Col span={12}>
        <Flex vertical gap={4} align="flex-start">
          <Text>Staked amount</Text>
          {isStakingInfoLoaded ? (
            <>
              <Text strong style={{ fontSize: 20 }}>
                {balanceFormat(totalOlasStakedBalance, 2)} OLAS
              </Text>
              {isStaked ? null : <Tag color="processing">Not yet staked</Tag>}
            </>
          ) : (
            <Flex vertical gap={8}>
              <Skeleton.Button active size="small" style={{ width: 92 }} />
              <Skeleton.Button active size="small" style={{ width: 92 }} />
            </Flex>
          )}
        </Flex>
      </Col>
    </RewardsRow>
  );
};

const NotifyRewards = () => {
  const { isEligibleForRewards, availableRewardsForEpochEther } = useReward();
  const { showNotification } = useElectronApi();

  useEffect(() => {
    const hasAlreadyNotified = false; // TODO: Implement this

    if (hasAlreadyNotified) return;
    if (!isEligibleForRewards) return;

    showNotification?.(
      'Your agent earned its first staking rewards!',
      `Congratulations! Your agent just got the first reward for you! Your current balance: ${availableRewardsForEpochEther} OLAS`,
    );
  }, [isEligibleForRewards, availableRewardsForEpochEther, showNotification]);

  return null;
};

export const MainRewards = () => (
  <>
    <DisplayRewards />
    <NotifyRewards />
  </>
);
