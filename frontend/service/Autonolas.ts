import { ethers } from 'ethers';
import { Contract as MulticallContract } from 'ethers-multicall';

import {
  AGENT_MECH_ABI,
  SERVICE_REGISTRY_L2_ABI,
  SERVICE_REGISTRY_TOKEN_UTILITY_ABI,
  SERVICE_STAKING_TOKEN_MECH_USAGE_ABI,
} from '@/abi';
import { Chain } from '@/client';
import {
  AGENT_MECH_CONTRACT,
  SERVICE_REGISTRY_L2_CONTRACT,
  SERVICE_REGISTRY_TOKEN_UTILITY_CONTRACT,
  SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT,
} from '@/constants';
import { gnosisMulticallProvider } from '@/constants/providers';
import { ServiceRegistryL2ServiceState } from '@/enums';
import { Address, StakingRewardsInfo } from '@/types';

const REQUIRED_MECH_REQUESTS_SAFETY_MARGIN = 1;

const agentMechContract = new MulticallContract(
  AGENT_MECH_CONTRACT[Chain.GNOSIS],
  AGENT_MECH_ABI.filter((abi) => abi.type === 'function'), // weird bug in the package where their filter doesn't work..
);

const serviceStakingTokenMechUsageContract = new MulticallContract(
  SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT[Chain.GNOSIS],
  SERVICE_STAKING_TOKEN_MECH_USAGE_ABI.filter((abi) => abi.type === 'function'), // same as above
);

const serviceRegistryTokenUtilityContract = new MulticallContract(
  SERVICE_REGISTRY_TOKEN_UTILITY_CONTRACT[Chain.GNOSIS],
  SERVICE_REGISTRY_TOKEN_UTILITY_ABI.filter((abi) => abi.type === 'function'), // same as above
);

const serviceRegistryL2Contract = new MulticallContract(
  SERVICE_REGISTRY_L2_CONTRACT[Chain.GNOSIS],
  SERVICE_REGISTRY_L2_ABI.filter((abi) => abi.type === 'function'), // same as above
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

  const contractCalls = [
    agentMechContract.getRequestsCount(agentMultisigAddress),
    serviceStakingTokenMechUsageContract.getServiceInfo(serviceId),
    serviceStakingTokenMechUsageContract.livenessPeriod(),
    serviceStakingTokenMechUsageContract.livenessRatio(),
    serviceStakingTokenMechUsageContract.rewardsPerSecond(),
  ];

  await gnosisMulticallProvider.init();

  const multicallResponse = await gnosisMulticallProvider.all(contractCalls);

  const [
    mechRequestCount,
    serviceInfo,
    livenessPeriod,
    livenessRatio,
    rewardsPerSecond,
  ] = multicallResponse;

  /**
   * serviceInfo represents the ServiceInfo struct in the ServiceStakingTokenMechUsage contract
   * struct ServiceInfo {
    // Service multisig address
    address multisig;
    // Service owner
    address owner;
    // Service multisig nonces
    uint256[] nonces; <-- (we use this in the rewards eligibility check)
    // Staking start time
    uint256 tsStart;
    // Accumulated service staking reward
    uint256 reward;
    // Accumulated inactivity that might lead to the service eviction
    uint256 inactivity;}
   */
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
  const contractCalls = [
    serviceStakingTokenMechUsageContract.rewardsPerSecond(),
    serviceStakingTokenMechUsageContract.livenessPeriod(),
  ];

  await gnosisMulticallProvider.init();

  const multicallResponse = await gnosisMulticallProvider.all(contractCalls);

  const [rewardsPerSecond, livenessPeriod] = multicallResponse;

  return rewardsPerSecond * livenessPeriod;
};

const getServiceRegistryInfo = async (
  operatorAddress: Address, // generally masterSafeAddress
  serviceId: number,
): Promise<{
  bondValue: number;
  depositValue: number;
  serviceState: ServiceRegistryL2ServiceState;
}> => {
  const contractCalls = [
    serviceRegistryTokenUtilityContract.getOperatorBalance(
      operatorAddress,
      serviceId,
    ),
    serviceRegistryTokenUtilityContract.mapServiceIdTokenDeposit(serviceId),
    serviceRegistryL2Contract.mapServices(serviceId),
  ];

  await gnosisMulticallProvider.init();

  const [
    operatorBalanceResponse,
    serviceIdTokenDepositResponse,
    mapServicesResponse,
  ] = await gnosisMulticallProvider.all(contractCalls);

  const [bondValue, depositValue, serviceState] = [
    parseFloat(ethers.utils.formatUnits(operatorBalanceResponse, 18)),
    parseFloat(ethers.utils.formatUnits(serviceIdTokenDepositResponse[1], 18)),
    mapServicesResponse.state as ServiceRegistryL2ServiceState,
  ];

  return {
    bondValue,
    depositValue,
    serviceState,
  };
};

export const AutonolasService = {
  getAgentStakingRewardsInfo,
  getAvailableRewardsForEpoch,
  getServiceRegistryInfo,
};
