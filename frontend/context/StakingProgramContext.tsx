import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { CHAINS } from '@/constants/chains';
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

  const [activeStakingProgram, setActiveStakingProgram] =
    useState<StakingProgram | null>();

  const updateStakingProgram = useCallback(async () => {
    // if no service nft, not staked
    const serviceId =
      service?.chain_configs[CHAINS.GNOSIS.chainId].chain_data?.token;

    if (!service?.chain_configs[CHAINS.GNOSIS.chainId].chain_data?.token) {
      setActiveStakingProgram(null);
      return;
    }

    if (serviceId) {
      // if service exists, we need to check if it is staked
      console.log('getting current staking program');
      AutonolasService.getCurrentStakingProgramByServiceId(serviceId).then(
        (stakingProgram) => {
          console.log('setting stakingProgram', stakingProgram);
          setActiveStakingProgram(stakingProgram);
        },
      );
    }
  }, [service]);

  useInterval(updateStakingProgram, 5000);

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
