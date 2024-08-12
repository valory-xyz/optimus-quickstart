import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';

import { Address } from './Address';

export type IncentiveProgram = {
  name: string;
  rewardsPerWorkPeriod: number;
  requiredOlasForStaking: number;
  status: IncentiveProgramStatus;
  contractAddress: Address;
};
