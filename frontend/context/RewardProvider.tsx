import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { AutonolasService } from '@/service/Autonolas';

import { ServicesContext } from './ServicesProvider';

export const RewardContext = createContext<{
  availableRewardsForEpoch: number | undefined;
  isEligibleForRewards: boolean | undefined;
}>({
  availableRewardsForEpoch: undefined,
  isEligibleForRewards: undefined,
});

export const RewardProvider = ({ children }: PropsWithChildren) => {
  const { services } = useContext(ServicesContext);
  const service = useMemo(() => services[0], [services]);

  const [availableRewardsForEpoch, setAvailableRewardsForEpoch] =
    useState<number>();
  const [isEligibleForRewards, setIsEligibleForRewards] = useState<boolean>();

  useInterval(async () => {
    // service is deployed, created, etc.

    let rewardsInfoPromise;
    if (service && service.chain_data.multisig && service.chain_data.token) {
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
  }, 5000);

  return (
    <RewardContext.Provider
      value={{
        availableRewardsForEpoch,
        isEligibleForRewards,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};
