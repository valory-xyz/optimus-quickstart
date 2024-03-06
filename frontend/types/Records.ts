import { Address } from '.';

export type AddressNumberRecord = Record<Address, number>;
export type AddressBooleanRecord = Record<Address, boolean>;
export type FundingRecord = Record<
  Address,
  { required: number; received: boolean }
>;
