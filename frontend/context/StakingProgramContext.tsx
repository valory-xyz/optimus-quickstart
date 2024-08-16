import { createContext, PropsWithChildren, useCallback, useState } from 'react';

import { StakingProgram } from '@/enums/StakingProgram';
import { useServices } from '@/hooks/useServices';
import { AutonolasService } from '@/service/Autonolas';

export const StakingProgramContext = createContext<{
  activeStakingProgram?: StakingProgram | null;
  defaultStakingProgram: StakingProgram;
  updateStakingProgram: () => Promise<void>;
}>({
  activeStakingProgram: undefined,
  defaultStakingProgram: StakingProgram.Beta,
  updateStakingProgram: async () => {},
});

/** Determines the current active staking program, if any */
export const StakingProgramProvider = ({ children }: PropsWithChildren) => {
  const { service } = useServices();

  const [activeStakingProgram, setCurrentStakingProgram] =
    useState<StakingProgram | null>();

  const updateStakingProgram = useCallback(async () => {
    // if no service / instance is available, we don't need to check for staking program
    if (!service?.chain_data?.instances?.[0]) {
      setCurrentStakingProgram(null);
      return;
    }

    // TODO: check if assuming the first service is the correct approach
    const operatorAddress = service?.chain_data?.instances?.[0];
    if (operatorAddress) {
      // if service exists, we need to check if it is staked
      AutonolasService.getCurrentStakingProgram(operatorAddress).then(
        setCurrentStakingProgram,
      );
    }
  }, [service]);

  return (
    <StakingProgramContext.Provider
      value={{
        activeStakingProgram,
        updateStakingProgram,
        defaultStakingProgram: StakingProgram.Beta,
      }}
    >
      {children}
    </StakingProgramContext.Provider>
  );
};
