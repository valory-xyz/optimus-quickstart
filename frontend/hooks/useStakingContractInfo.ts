import { useContext } from 'react';

import { StakingContractInfoContext } from '@/context/StakingContractInfoProvider';

export const useStakingContractInfo = () => {
  const {
    canStartAgent,
    hasEnoughServiceSlots,
    isAgentEvicted,
    isRewardsAvailable,
    isStakingContractInfoLoading,
  } = useContext(StakingContractInfoContext);

  return {
    canStartAgent,
    hasEnoughServiceSlots,
    isAgentEvicted,
    isRewardsAvailable,
    isStakingContractInfoLoading,
  };
};
