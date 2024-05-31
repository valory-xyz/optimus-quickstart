import { useEffect } from 'react';

import { AutonolasService } from '@/service/Autonolas';

export const StakingValidations = () => {
  useEffect(() => {
    const getRewards = async () => {
      await AutonolasService.getStakingContractInfo();
    };
    getRewards();
  }, []);

  return null;
};
