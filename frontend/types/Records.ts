import { Token } from '@/enums';

import { Address } from '.';

export type AddressNumberRecord = Record<Address, number>;
export type AddressBooleanRecord = Record<Address, boolean>;

// defines token balances in a wallet by token name
export type WalletAddressNumberRecord = Record<
  Address,
  Record<Token.ETH | Token.OLAS, number>
>;
