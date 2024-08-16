import { useContext, useState } from 'react';

import { STAKING_PROGRAM_META } from '@/constants/stakingProgramMeta';
import { StakingProgramContext } from '@/context/StakingProgramContext';

/**
 *  Mock hook for staking program abstraction
 * @returns {currentStakingProgram: IncentiveProgram}
 */
export const useStakingProgram = () => {
  const { activeStakingProgram, defaultStakingProgram } = useContext(
    StakingProgramContext,
  );

  const [isMigrating, setIsMigrating] = useState(false);

  const activeStakingProgramMeta =
    STAKING_PROGRAM_META[activeStakingProgram ?? defaultStakingProgram];

  // TODO: Implement migration logic
  const migrate = async () => {
    setIsMigrating(true);
    await setTimeout(() => {
      setIsMigrating(false);
    }, 1000);
  };

  return {
    activeStakingProgram,
    activeStakingProgramMeta,
    defaultStakingProgram,
    isMigrating,
    migrate,
  };
};
