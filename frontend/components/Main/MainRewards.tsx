import { Flex, Tag, Typography } from 'antd';
import { memo } from 'react';

import { balanceFormat } from '@/common-util';
import { useReward } from '@/hooks/useReward';

import { CardSection } from '../styled/CardSection';

export const MainRewards = () => {
  const { availableRewardsForEpochEther, isEligibleForRewards } = useReward();
  return (
    <CardSection gap={5} vertical>
      <Typography.Text>Rewards today </Typography.Text>
      <Flex gap={10}>
        <Typography.Text strong>
          {balanceFormat(availableRewardsForEpochEther, 2)} OLAS
        </Typography.Text>
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
