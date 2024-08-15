import { useState } from 'react';

import { StakingProgramStatus } from '@/enums/StakingProgramStatus';
import { StakingProgram } from '@/types/StakingProgram';

/**
 *  Mock hook for staking program abstraction
 * @returns {currentStakingProgram: IncentiveProgram}
 */
export const useStakingProgram = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  // TODO: Calculate current staking program
  // from current staking contract address
  const currentStakingProgram: StakingProgram = {
    name: 'Pearl Alpha',
    status: StakingProgramStatus.Selected,
    contractAddress: '0x',
    rewardsPerWorkPeriod: 0.25,
    requiredOlasForStaking: 20,
  };

  // TODO: Implement migration logic
  const migrate = async () => {
    setIsMigrating(true);
    await setTimeout(() => {
      setIsMigrating(false);
    }, 1000);
  };

  return {
    currentStakingProgram,
    isMigrating,
    migrate,
  };
};
