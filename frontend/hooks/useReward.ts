import { useContext } from 'react';

import { RewardContext } from '@/context/RewardProvider';

export const useReward = () => {
  const {
    availableRewardsForEpoch,
    availableRewardsForEpochEth,
    isEligibleForRewards,
    minimumStakedAmountRequired,
  } = useContext(RewardContext);

  return {
    availableRewardsForEpoch,
    availableRewardsForEpochEth,
    isEligibleForRewards,
    minimumStakedAmountRequired,
  };
};
