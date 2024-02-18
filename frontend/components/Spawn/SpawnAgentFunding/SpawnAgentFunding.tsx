import { Service } from "@/client";
import { Funding } from "../Funding/Funding";
import { SpawnScreenState } from "@/enums";

export const SpawnAgentFunding = (props: {
  service?: Service;
  agentFundRequirements: { [address: string]: number };
  nextPage: SpawnScreenState;
}) => <Funding fundRequirements={props.agentFundRequirements} {...props} />;
