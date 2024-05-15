import { Chain } from '@/client';

export const MIN_ETH_BALANCE_THRESHOLDS = {
  [Chain.GNOSIS]: {
    safeCreation: 0.1,
    safeAddSigner: 0.1,
  },
};
