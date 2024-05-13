import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { AutonolasService } from '@/service/Autonolas';

import { ServicesContext } from './ServicesProvider';

export const RewardContext = createContext<{
  availableRewardsForEpoch?: number;
  isEligibleForRewards?: boolean;
  optimisticRewardsEarnedForEpoch?: number;
  updateRewards: () => Promise<void>;
}>({
  availableRewardsForEpoch: undefined,
  isEligibleForRewards: undefined,
  optimisticRewardsEarnedForEpoch: undefined,
  updateRewards: async () => {},
});

export const RewardProvider = ({ children }: PropsWithChildren) => {
  const { services } = useContext(ServicesContext);
  const service = useMemo(() => services[0], [services]);

  const [availableRewardsForEpoch, setAvailableRewardsForEpoch] =
    useState<number>();
  const [isEligibleForRewards, setIsEligibleForRewards] = useState<boolean>();

  const optimisticRewardsEarnedForEpoch = useMemo<number | undefined>(() => {
    if (isEligibleForRewards && availableRewardsForEpoch) {
      return availableRewardsForEpoch;
    }
    return;
  }, [availableRewardsForEpoch, isEligibleForRewards]);

  const updateRewards = useCallback(async (): Promise<void> => {
    // service is deployed, created, etc.

    let rewardsInfoPromise;
    if (service?.chain_data?.multisig && service?.chain_data?.token) {
      rewardsInfoPromise = AutonolasService.getAgentStakingRewardsInfo({
        agentMultisigAddress: service.chain_data.multisig,
        serviceId: service.chain_data.token,
      });
    }

    const rewardsPromise = AutonolasService.getAvailableRewardsForEpoch();
    const [rewardsInfo, rewards] = await Promise.all([
      rewardsInfoPromise,
      rewardsPromise,
    ]);

    setIsEligibleForRewards(rewardsInfo?.isEligibleForRewards);
    setAvailableRewardsForEpoch(rewards);
  }, [service]);

  useInterval(async () => updateRewards(), 5000);

  return (
    <RewardContext.Provider
      value={{
        availableRewardsForEpoch,
        isEligibleForRewards,
        optimisticRewardsEarnedForEpoch,
        updateRewards,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};
