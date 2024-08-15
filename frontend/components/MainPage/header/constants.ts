import { formatUnits } from 'ethers/lib/utils';

import { CHAINS } from '@/constants/chains';
import { SERVICE_TEMPLATES } from '@/constants/serviceTemplates';

// TODO: Move this to more appropriate location (root /constants)
const olasCostOfBond = Number(
  formatUnits(
    `${SERVICE_TEMPLATES[0].configurations[CHAINS.GNOSIS.chainId].cost_of_bond}`,
    18,
  ),
);

const olasRequiredToStake = Number(
  formatUnits(
    `${SERVICE_TEMPLATES[0].configurations[CHAINS.GNOSIS.chainId].olas_required_to_stake}`,
    18,
  ),
);

export const requiredOlas = olasCostOfBond + olasRequiredToStake;
export const requiredGas = Number(
  formatUnits(
    `${SERVICE_TEMPLATES[0].configurations[CHAINS.GNOSIS.chainId].monthly_gas_estimate}`,
    18,
  ),
);
