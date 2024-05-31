import { useCallback, useEffect } from 'react';
import { create } from 'zustand';

import { AutonolasService } from '@/service/Autonolas';

export const useStakingContractInfo = create<{
  isStakingContractInfoLoading: boolean;
  isRewardsAvailable: boolean;
  hasEnoughServiceSlots: boolean;
}>((set) => {
  const fetchStakingContractInfo = useCallback(async () => {
    try {
      set({ isStakingContractInfoLoading: true });
      const info = await AutonolasService.getStakingContractInfo();

      if (!info) return;

      const { availableRewards, maxNumServices, getServiceIds } = info;

      set({
        // availableRewards,
        // maxNumServices,
        // getServiceIds,
        isRewardsAvailable: availableRewards > 0,
        hasEnoughServiceSlots: getServiceIds.length < maxNumServices,
      });
    } catch (error) {
      console.error('Failed to fetch staking contract info', error);
    } finally {
      set({ isStakingContractInfoLoading: false });
    }
  }, [set]);

  useEffect(() => {
    fetchStakingContractInfo();
  }, [fetchStakingContractInfo]);

  return {
    // maxNumServices: null,
    // availableRewards: null,
    // getServiceIds: null,
    isStakingContractInfoLoading: true,
    isRewardsAvailable: false,
    hasEnoughServiceSlots: false,
  };
});
