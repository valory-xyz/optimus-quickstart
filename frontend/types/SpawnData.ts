import { ServiceTemplate, Service } from '@/client';
import { SpawnScreen } from '@/enums';
import { FundingRecord } from '.';

export type SpawnData = {
  agentFundRequirements: FundingRecord;
  masterWalletFundRequirements: FundingRecord;
  isStaking?: boolean;
  nativeBalance?: number;
  rpc: string;
  screen?: SpawnScreen;
  serviceTemplate?: ServiceTemplate;
  service?: Service;
};
