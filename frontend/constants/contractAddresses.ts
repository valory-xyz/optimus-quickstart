import { Chain } from '@/client';
import { Address } from '@/types';

export const MULTICALL_CONTRACT_ADDRESS: Address =
  '0xcA11bde05977b3631167028862bE2a173976CA11'; // https://github.com/mds1/multicall, https://www.multicall3.com/

export const SERVICE_REGISTRY_L2_CONTRACT_ADDRESS: Record<number, Address> = {
  [Chain.GNOSIS]: '0x9338b5153AE39BB89f50468E608eD9d764B755fD',
};

export const SERVICE_REGISTRY_TOKEN_UTILITY_CONTRACT_ADDRESS: Record<
  number,
  Address
> = {
  [Chain.GNOSIS]: '0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8',
};

export const SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT_ADDRESS: Record<
  number,
  Address
> = {
  [Chain.GNOSIS]: '0xEE9F19b5DF06c7E8Bfc7B28745dcf944C504198A',
};

export const AGENT_MECH_CONTRACT_ADDRESS: Record<number, Address> = {
  [Chain.GNOSIS]: '0x77af31De935740567Cf4fF1986D04B2c964A786a',
};

export const MECH_ACTIVITY_CHECKER_CONTRACT_ADDRESS: Record<number, Address> = {
  [Chain.GNOSIS]: '0x155547857680A6D51bebC5603397488988DEb1c8',
};
