import { Service } from '@/client';
import { Funding } from './Funding/Funding';
import { SpawnScreenState } from '@/enums';
import { FundRequirementETH } from './Funding/FundRequirement/FundRequirementETH';
import { FundsRequirementMap } from '@/types';

type SpawnAgentFundingProps = {
  service: Service;
  agentFundRequirements: FundsRequirementMap;
  nextPage: SpawnScreenState;
};

export const SpawnAgentFunding = (props: SpawnAgentFundingProps) => (
  <Funding
    fundRequirements={props.agentFundRequirements}
    symbol={'XDAI'} // hardcoded while only trader is available
    FundRequirementComponent={FundRequirementETH}
    {...props}
  />
);
