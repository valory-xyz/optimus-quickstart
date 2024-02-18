import { Service } from "@/client";
import { Funding } from "../Funding/Funding";
import { SpawnScreenState } from "@/enums";

export const SpawnStakingFunding = (props: {
  service: Service | undefined;
  stakingFundRequirements: { [address: string]: number };
  nextPage: SpawnScreenState;
}) => {
  return (
    <Funding fundRequirements={props.stakingFundRequirements} {...props} />
  );
};
