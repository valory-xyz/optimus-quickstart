import { useEthers } from '@/hooks';
import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';
import { Address, FundsReceivedMap } from '@/types';

type FundRequirementETHProps = {
  serviceHash?: string;
  address: Address;
  symbol: string;
  requirement: number;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<FundsReceivedMap>>;
};

export const FundRequirementETH = (props: FundRequirementETHProps) => {
  const { getEthBalance: getETHBalance } = useEthers();
  return (
    <FundRequirement getBalance={getETHBalance} isERC20={false} {...props} />
  );
};
