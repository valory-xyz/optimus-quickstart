import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { FIVE_SECONDS_INTERVAL } from '@/constants/intervals';
import { AutonolasService } from '@/service/Autonolas';

type StakingContractInfoContextProps = {
  updateStakingContractInfo: () => Promise<void>;
  isStakingContractInfoLoading: boolean;
  isRewardsAvailable: boolean;
  hasEnoughServiceSlots: boolean;
  isAgentEvicted: boolean; // TODO: Implement this
  canStartAgent: boolean;
};

export const StakingContractInfoContext =
  createContext<StakingContractInfoContextProps>({
    updateStakingContractInfo: async () => {},
    isStakingContractInfoLoading: true,
    isRewardsAvailable: false,
    hasEnoughServiceSlots: false,
    isAgentEvicted: false,
    canStartAgent: false,
  });

export const StakingContractInfoProvider = ({
  children,
}: PropsWithChildren) => {
  const [isStakingContractInfoLoading, setIsStakingContractInfoLoading] =
    useState(true);
  const [isRewardsAvailable, setIsRewardsAvailable] = useState(false);
  const [hasEnoughServiceSlots, setHasEnoughServiceSlots] = useState(false);
  const [isAgentEvicted, setIsAgentEvicted] = useState(false);
  const [canStartAgent, setCanStartAgent] = useState(false);

  const updateStakingContractInfo = useCallback(async () => {
    setIsStakingContractInfoLoading(true);
    try {
      const info = await AutonolasService.getStakingContractInfo();
      if (!info) return;

      const { availableRewards, maxNumServices, serviceIds } = info;
      const isRewardsAvailable = availableRewards > 0;
      const hasEnoughServiceSlots = serviceIds.length < maxNumServices;
      const canStartAgent = isRewardsAvailable && hasEnoughServiceSlots;

      setIsRewardsAvailable(isRewardsAvailable);
      setHasEnoughServiceSlots(hasEnoughServiceSlots);
      setCanStartAgent(canStartAgent);
      setIsAgentEvicted(false); // TODO: Implement this
    } catch (error) {
      console.error('Failed to fetch staking contract info', error);
    } finally {
      setIsStakingContractInfoLoading(false);
    }
  }, []);

  useInterval(updateStakingContractInfo, FIVE_SECONDS_INTERVAL);

  return (
    <StakingContractInfoContext.Provider
      value={{
        updateStakingContractInfo,
        isStakingContractInfoLoading,
        isRewardsAvailable,
        hasEnoughServiceSlots,
        isAgentEvicted,
        canStartAgent,
      }}
    >
      {children}
    </StakingContractInfoContext.Provider>
  );
};
