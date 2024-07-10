import { useContext } from 'react';

import { StakingContractInfoContext } from '@/context/StakingContractInfoProvider';

export const useStakingContractInfo = () =>
  useContext(StakingContractInfoContext);
