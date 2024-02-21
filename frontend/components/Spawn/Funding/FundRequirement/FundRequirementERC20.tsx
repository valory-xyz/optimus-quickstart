import { useEthers } from '@/hooks';
import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';
import { Address } from '@/types';

type FundRequirementERC20Props = {
  serviceHash: string;
  address: Address;
  requirement: number;
  symbol: string;
  contractAddress?: Address;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<{ [address: Address]: boolean }>>;
};

export const FundRequirementERC20 = (props: FundRequirementERC20Props) => {
  const { getERC20Balance } = useEthers();
  return (
    <FundRequirement getBalance={getERC20Balance} isERC20={true} {...props} />
  );
};
