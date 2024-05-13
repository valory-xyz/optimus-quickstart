import { Flex, Tag, Typography } from 'antd';
import { memo } from 'react';

import { balanceFormat } from '@/common-util';
import { useReward } from '@/hooks/useReward';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

export const MainRewards = () => {
  const { availableRewardsForEpochEther, isEligibleForRewards } = useReward();
  return (
    <CardSection gap={5} vertical>
      <Text>Staking rewards today </Text>
      <Flex gap={10}>
        <Text strong>
          {balanceFormat(availableRewardsForEpochEther, 2)} OLAS
        </Text>
        <RewardsEarned isEligibleForRewards={isEligibleForRewards} />
      </Flex>
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
