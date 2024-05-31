import { create } from 'zustand';

import { AutonolasService } from '@/service/Autonolas';

const initialState = {
  isStakingContractInfoLoading: true,
  isRewardsAvailable: false,
  hasEnoughServiceSlots: false,
  maxNumServices: 0,
};

export const useStakingContractInfo = create<{
  isStakingContractInfoLoading: boolean;
  isRewardsAvailable: boolean;
  hasEnoughServiceSlots: boolean;
  fetchStakingContractInfo: () => Promise<void>;
  maxNumServices: number;
}>((set) => {
  return {
    // maxNumServices: null,
    // availableRewards: null,
    // getServiceIds: null,
    ...initialState,
    isStakingContractInfoLoading: true,
    isRewardsAvailable: false,
    fetchStakingContractInfo: async () => {
      try {
        set({ isStakingContractInfoLoading: true });
        const info = await AutonolasService.getStakingContractInfo();

        if (!info) return;

        const { availableRewards, maxNumServices, getServiceIds } = info;

        set({
          // availableRewards,
          maxNumServices,
          // getServiceIds,
          isRewardsAvailable: availableRewards > 0,
          hasEnoughServiceSlots: getServiceIds.length < maxNumServices,
        });
      } catch (error) {
        console.error('Failed to fetch staking contract info', error);
      } finally {
        set({ isStakingContractInfoLoading: false });
      }
    },
  };
});
