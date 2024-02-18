import { Service } from "@/client";
import { Funding } from "../Funding/Funding";
import { SpawnScreenState } from "@/enums";
import { FundRequirementERC20 } from "../Funding/FundRequirement/FundRequirementERC20";
import { TOKENS } from "@/constants/tokens";

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
      symbol={"OLAS"} // hardcoded while only trader is available
      contractAddress={TOKENS.GNOSIS.OLAS} // same as above
      service={service}
      nextPage={nextPage}
      FundRequirementComponent={FundRequirementERC20}
    />
  );
};
