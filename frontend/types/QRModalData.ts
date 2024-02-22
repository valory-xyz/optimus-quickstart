import { Address } from './Address';

export type QRModalData = {
  open: boolean;
  address?: Address;
  amount?: number;
  chainId?: number;
  isErc20: boolean;
};
