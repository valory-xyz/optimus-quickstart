import { Chain } from '@/client';
import { Address } from '@/types';

export const MULTICALL_CONTRACT: Address =
  '0xcA11bde05977b3631167028862bE2a173976CA11'; // https://github.com/mds1/multicall, https://www.multicall3.com/

export const SERVICE_REGISTRY_L2: Record<number, Address> = {
  [Chain.GNOSIS]: '0x9338b5153AE39BB89f50468E608eD9d764B755fD',
};

export const SERVICE_REGISTRY_TOKEN_UTILITY: Record<number, Address> = {
  [Chain.GNOSIS]: '0xa45E64d13A30a51b91ae0eb182e88a40e9b18eD8',
};

export const SERVICE_STAKING_TOKEN_MECH_USAGE: Record<number, Address> = {
  [Chain.GNOSIS]: '0x43fb32f25dce34eb76c78c7a42c8f40f84bcd237',
};
