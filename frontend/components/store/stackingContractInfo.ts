import { create } from 'zustand';

import { AutonolasService } from '@/service/Autonolas';

const initialState = {
  isStakingContractInfoLoading: true,
  isRewardsAvailable: false,
  hasEnoughServiceSlots: false,
  canStartAgent: false,
};

export const useStakingContractInfo = create<{
  isStakingContractInfoLoading: boolean;
  isRewardsAvailable: boolean;
  hasEnoughServiceSlots: boolean;
  canStartAgent: boolean;
  fetchStakingContractInfo: () => Promise<void>;
}>((set) => {
  return {
    ...initialState,
    isStakingContractInfoLoading: true,
    isRewardsAvailable: false,
    fetchStakingContractInfo: async () => {
      try {
        set({ isStakingContractInfoLoading: true });
        const info = await AutonolasService.getStakingContractInfo();

        if (!info) return;

        const { availableRewards, maxNumServices, getServiceIds } = info;
        const isRewardsAvailable = availableRewards > 0;
        const hasEnoughServiceSlots = getServiceIds.length < maxNumServices;
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
