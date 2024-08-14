import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';

import { Address } from './Address';

export type IncentiveProgram = {
  name: string;
  rewardsPerWorkPeriod: number;
  requiredOlasForStaking: number;
  isEnoughSlots: boolean;
  status: IncentiveProgramStatus;
  contractAddress: Address;
};
