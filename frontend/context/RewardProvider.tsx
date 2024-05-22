import { ethers } from 'ethers';
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
  availableRewardsForEpochEth?: number;
  isEligibleForRewards?: boolean;
  optimisticRewardsEarnedForEpoch?: number;
  updateRewards: () => Promise<void>;
}>({
  availableRewardsForEpoch: undefined,
  availableRewardsForEpochEth: undefined,
  isEligibleForRewards: undefined,
  optimisticRewardsEarnedForEpoch: undefined,
  updateRewards: async () => {},
});

export const RewardProvider = ({ children }: PropsWithChildren) => {
  const { services } = useContext(ServicesContext);
  const service = useMemo(() => services?.[0], [services]);

  const [availableRewardsForEpoch, setAvailableRewardsForEpoch] =
    useState<number>();
  const [isEligibleForRewards, setIsEligibleForRewards] = useState<boolean>();

  const availableRewardsForEpochEth = useMemo<number | undefined>(() => {
    if (!availableRewardsForEpoch) return;

    const formatRewardsEth = parseFloat(
      ethers.utils.formatUnits(`${availableRewardsForEpoch}`, 18),
    );

    return formatRewardsEth;
  }, [availableRewardsForEpoch]);

  const optimisticRewardsEarnedForEpoch = useMemo<number | undefined>(() => {
    if (isEligibleForRewards && availableRewardsForEpochEth) {
      return availableRewardsForEpochEth;
    }
    return;
  }, [availableRewardsForEpochEth, isEligibleForRewards]);

  const updateRewards = useCallback(async (): Promise<void> => {
    let rewardsInfoPromise;
    if (service?.chain_data?.multisig && service?.chain_data?.token) {
      rewardsInfoPromise = AutonolasService.getAgentStakingRewardsInfo({
        agentMultisigAddress: service?.chain_data?.multisig,
        serviceId: service?.chain_data?.token,
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
        availableRewardsForEpochEth,
        isEligibleForRewards,
        optimisticRewardsEarnedForEpoch,
        updateRewards,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};
