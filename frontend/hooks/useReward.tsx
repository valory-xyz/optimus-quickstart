import { ethers } from 'ethers';
import { useContext, useMemo } from 'react';

import { RewardContext } from '@/context/RewardProvider';

export const useReward = () => {
  const { availableRewardsForEpoch, isEligibleForRewards } =
    useContext(RewardContext);

  const availableRewardsForEpochEther = useMemo<number | undefined>(() => {
    if (!availableRewardsForEpoch) return;

    const parsedRewardsEth = parseFloat(
      ethers.utils.formatUnits(`${availableRewardsForEpoch}`, 18),
    );

    return parsedRewardsEth;
  }, [availableRewardsForEpoch]);

  return {
    availableRewardsForEpoch,
    availableRewardsForEpochEther,
    isEligibleForRewards,
  };
};
