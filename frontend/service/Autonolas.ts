import { Contract as MulticallContract } from 'ethers-multicall';

import { AGENT_MECH_ABI } from '@/abi/agentMech';
import { SERVICE_STAKING_TOKEN_MECH_USAGE_ABI } from '@/abi/serviceStakingTokenMechUsage';
import { Chain } from '@/client';
import {
  AGENT_MECH_CONTRACT,
  SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT,
} from '@/constants';
import { gnosisMulticallProvider } from '@/constants/providers';
import { Address } from '@/types';
import { StakingRewardsInfo } from '@/types/Autonolas';

const REQUIRED_MECH_REQUESTS_SAFETY_MARGIN = 1;

const agentMechContract = new MulticallContract(
  AGENT_MECH_CONTRACT[Chain.GNOSIS],
  AGENT_MECH_ABI.filter((abi) => abi.type === 'function'), // weird bug where this filter doesn't work in the package..
);

const serviceStakingTokenMechUsageContract = new MulticallContract(
  SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT[Chain.GNOSIS],
  SERVICE_STAKING_TOKEN_MECH_USAGE_ABI.filter((abi) => abi.type === 'function'), // same as above
);

const getAgentStakingRewardsInfo = async ({
  agentMultisigAddress,
  serviceId,
}: {
  agentMultisigAddress: Address;
  serviceId: number;
}): Promise<StakingRewardsInfo | undefined> => {
  if (!agentMultisigAddress) return;
  if (!serviceId) return;

  const multicallResponse = await gnosisMulticallProvider.all([
    agentMechContract.getRequestCount(agentMultisigAddress),
    serviceStakingTokenMechUsageContract.getServiceInfo(serviceId),
    serviceStakingTokenMechUsageContract.livenessPeriod(),
    serviceStakingTokenMechUsageContract.livenessRatio(),
    serviceStakingTokenMechUsageContract.rewardsPerSecond(),
  ]);

  const [
    mechRequestCount,
    serviceInfo,
    livenessPeriod,
    livenessRatio,
    rewardsPerSecond,
  ] = multicallResponse;

  const isEligibleForRewards =
    mechRequestCount - serviceInfo[2][1] >=
    (livenessPeriod * livenessRatio) / 10 ** 18 +
      REQUIRED_MECH_REQUESTS_SAFETY_MARGIN;

  const availableRewardsForEpoch = rewardsPerSecond * livenessPeriod;

  return {
    mechRequestCount,
    serviceInfo,
    livenessPeriod,
    livenessRatio,
    rewardsPerSecond,
    isEligibleForRewards,
    availableRewardsForEpoch,
  } as StakingRewardsInfo;
};

const getAvailableRewardsForEpoch = async (): Promise<number | undefined> => {
  const multicallResponse = await gnosisMulticallProvider.all([
    serviceStakingTokenMechUsageContract.rewardsPerSecond(),
    serviceStakingTokenMechUsageContract.livenessPeriod(),
  ]);

  const [rewardsPerSecond, livenessPeriod] = multicallResponse;

  return rewardsPerSecond * livenessPeriod;
};

export const AutonolasService = {
  getAgentStakingRewardsInfo,
  getAvailableRewardsForEpoch,
};
