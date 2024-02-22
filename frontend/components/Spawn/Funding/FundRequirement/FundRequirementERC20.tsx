import { useEthers } from '@/hooks';
import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';
import { Address, FundsReceivedMap } from '@/types';

type FundRequirementERC20Props = {
  serviceHash: string;
  address: Address;
  requirement: number;
  symbol: string;
  contractAddress?: Address;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<FundsReceivedMap>>;
};

export const FundRequirementERC20 = (props: FundRequirementERC20Props) => {
  const { getErc20Balance: getERC20Balance } = useEthers();
  return (
    <FundRequirement getBalance={getERC20Balance} isERC20={true} {...props} />
  );
};
