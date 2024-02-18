import { Service } from "@/client";
import { Funding } from "../Funding/Funding";
import { SpawnScreenState } from "@/enums";
import { FundRequirementERC20 } from "../Funding/FundRequirement/FundRequirementERC20";

export const SpawnStakingFunding = ({
  service,
  stakingFundRequirements,
  nextPage,
}: {
  service: Service;
  stakingFundRequirements: { [address: string]: number };
  nextPage: SpawnScreenState;
}) => {
  return (
    <Funding
      fundRequirements={stakingFundRequirements}
      symbol={"OLAS"}
      service={service}
      nextPage={nextPage}
      FundRequirementComponent={FundRequirementERC20}
    />
  );
};
