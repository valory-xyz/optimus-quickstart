import { create } from 'zustand';

import { AutonolasService } from '@/service/Autonolas';

const initialState = {
  isStakingContractInfoLoading: true,
  isRewardsAvailable: false,
  hasEnoughServiceSlots: false,
  isAgentEvicted: false, // TODO: Implement this
  canStartAgent: false,
};

type StakingContractInfoStore = {
  isStakingContractInfoLoading: boolean;
  isRewardsAvailable: boolean;
  hasEnoughServiceSlots: boolean;
  isAgentEvicted: boolean; // TODO: Implement this
  canStartAgent: boolean;
  fetchStakingContractInfo: () => Promise<void>;
};

export const useStakingContractInfo = create<StakingContractInfoStore>()((
  set,
) => {
  return {
    ...initialState,
    isStakingContractInfoLoading: true,
    isRewardsAvailable: false,
    fetchStakingContractInfo: async () => {
      try {
        set({ isStakingContractInfoLoading: true });
        const info = await AutonolasService.getStakingContractInfo();

        if (!info) return;

        const { availableRewards, maxNumServices, serviceIds } = info;
        const isRewardsAvailable = availableRewards > 0;
        const hasEnoughServiceSlots = serviceIds.length < maxNumServices;
        const canStartAgent = isRewardsAvailable && hasEnoughServiceSlots;

        set({
          isRewardsAvailable,
          hasEnoughServiceSlots,
          canStartAgent,
        });
      } catch (error) {
        console.error('Failed to fetch staking contract info', error);
      } finally {
        set({ isStakingContractInfoLoading: false });
      }
    },
  };
});
