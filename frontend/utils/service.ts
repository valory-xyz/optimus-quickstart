import { ServiceTemplate } from '@/client';
import { StakingProgram } from '@/enums/StakingProgram';

/** TODO: update from hardcoded, workaround for quick release */
export const getMinimumStakedAmountRequired = (
  serviceTemplate: ServiceTemplate,
  stakingProgram: StakingProgram = StakingProgram.Beta,
) => {
  // const olasCostOfBond = Number(
  //   formatUnits(
  //     `${serviceTemplate.configurations[CHAINS.GNOSIS.chainId].cost_of_bond}`,
  //     18,
  //   ),
  // );

  if (stakingProgram === StakingProgram.Alpha) {
    return 20;
  }

  return 40;
};
