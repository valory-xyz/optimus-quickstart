import { Flex, Skeleton, Tag, Typography } from 'antd';
import { memo } from 'react';
import styled from 'styled-components';

import { balanceFormat } from '@/common-util';
import { useBalance } from '@/hooks';
import { useReward } from '@/hooks/useReward';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

const Loader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 4px;
`;

export const MainRewards = () => {
  const { availableRewardsForEpochEth, isEligibleForRewards } = useReward();
  const { isBalanceLoaded } = useBalance();

  return (
    <CardSection gap={5} vertical>
      <Text>Staking rewards today </Text>
      {isBalanceLoaded ? (
        <Flex gap={10}>
          <Text strong>
            {balanceFormat(availableRewardsForEpochEth, 2)} OLAS
          </Text>
          <RewardsEarned isEligibleForRewards={isEligibleForRewards} />
        </Flex>
      ) : (
        <Loader>
          <Skeleton.Button active size="small" style={{ width: 92 }} />
          <Skeleton.Button active size="small" style={{ width: 92 }} />
        </Loader>
      )}
    </CardSection>
  );
};

const RewardsEarned = memo(function RewardsEarned({
  isEligibleForRewards,
}: {
  isEligibleForRewards?: boolean;
}) {
  if (!isEligibleForRewards)
    return <Tag color="processing">Not yet earned</Tag>;
  return <Tag color="success">Earned</Tag>;
});
