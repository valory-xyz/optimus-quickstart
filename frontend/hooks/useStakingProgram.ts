import { useContext } from 'react';

import { STAKING_PROGRAM_META } from '@/constants/stakingProgramMeta';
import { StakingProgramContext } from '@/context/StakingProgramContext';

/**
 *  Mock hook for staking program abstraction
 * @returns {currentStakingProgram: IncentiveProgram}
 */
export const useStakingProgram = () => {
  const { activeStakingProgram, defaultStakingProgram, updateStakingProgram } =
    useContext(StakingProgramContext);

  const isLoadedActiveStakingProgram = activeStakingProgram !== undefined;

  const activeStakingProgramMeta =
    activeStakingProgram === undefined
      ? null
      : activeStakingProgram === null
        ? null
        : STAKING_PROGRAM_META[activeStakingProgram];

  return {
    activeStakingProgram,
    activeStakingProgramMeta,
    defaultStakingProgram,
    updateStakingProgram,
    isLoadedActiveStakingProgram,
  };
};
