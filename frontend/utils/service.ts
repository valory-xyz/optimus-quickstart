import { formatUnits } from 'ethers/lib/utils';

import { ServiceTemplate } from '@/client';
import { CHAINS } from '@/constants/chains';

export const getMinimumStakedAmountRequired = (
  serviceTemplate: ServiceTemplate,
) => {
  const olasCostOfBond = Number(
    formatUnits(
      `${serviceTemplate.configurations[CHAINS.GNOSIS.chainId].cost_of_bond}`,
      18,
    ),
  );
  const olasRequiredToStake = Number(
    formatUnits(
      `${serviceTemplate.configurations[CHAINS.GNOSIS.chainId].olas_required_to_stake}`,
      18,
    ),
  );

  return olasCostOfBond + olasRequiredToStake;
};
