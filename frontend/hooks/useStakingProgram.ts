import { useState } from 'react';

import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';
import { IncentiveProgram } from '@/types/IncentiveProgram';

/**
 *  Mock hook for staking program abstraction
 * @returns {currentStakingProgram: IncentiveProgram}
 */
export const useStakingProgram = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  // TODO: Calculate current staking program
  // from current staking contract address
  const currentStakingProgram: IncentiveProgram = {
    name: 'Pearl Alpha',
    status: IncentiveProgramStatus.Selected,
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
