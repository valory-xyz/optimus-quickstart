import { Funding } from './Funding/Funding';
import { SpawnScreen } from '@/enums';
import { FundRequirementETH } from './Funding/FundRequirement/FundRequirementETH';
import { useSpawn } from '@/hooks';

type SpawnAgentFundingProps = {
  nextPage: SpawnScreen;
};

export const SpawnAgentFunding = (props: SpawnAgentFundingProps) => {
  const {
    spawnData: { agentFundRequirements: fundRequirements },
  } = useSpawn();
  return (
    <Funding
      fundRequirements={fundRequirements}
      statement="Please fund the agent wallets to continue."
      symbol={'XDAI'} // hardcoded while only trader is available
      FundRequirementComponent={FundRequirementETH}
      {...props}
    />
  );
};
