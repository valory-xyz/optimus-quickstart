import { Service } from "@/client";
import { Funding } from "../Funding/Funding";
import { SpawnScreenState } from "@/enums";
import { FundRequirementETH } from "../Funding/FundRequirement/FundRequirementETH";

export const SpawnAgentFunding = (props: {
  service: Service;
  agentFundRequirements: { [address: string]: number };
  nextPage: SpawnScreenState;
}) => (
  <Funding
    fundRequirements={props.agentFundRequirements}
    symbol={"XDAI"} // hardcoded while only trader is available
    FundRequirementComponent={FundRequirementETH}
    {...props}
  />
);
