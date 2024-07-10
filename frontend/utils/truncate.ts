import { Address } from '@/types/Address';

export const truncateAddress = (address: Address) =>
  `${address?.substring(0, 6)}...${address?.substring(address.length - 4, address.length)}`;
