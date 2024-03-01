import { FundsRequirementMap } from '@/types';
import { Funding } from './Funding/Funding';
import { SpawnScreenState } from '@/enums';
import { FundRequirementETH } from './Funding/FundRequirement/FundRequirementETH';

export const SpawnMasterWalletFunding = (props: {
  fundRequirements: FundsRequirementMap;
  nextPage: SpawnScreenState;
  rpc: string;
}) => {
  return (
    <Funding
      statement="Please fund the master wallet to continue."
      FundRequirementComponent={FundRequirementETH}
      symbol={'XDAI'} // hardcoded while only trader is available
      {...props}
    />
  );
};
