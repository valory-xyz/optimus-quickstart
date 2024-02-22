import { Address } from '.';

export type BalancesMap = { [address: Address]: number };
export type FundsRequirementMap = { [address: Address]: number };
export type FundsReceivedMap = { [address: Address]: boolean };
