import { useEthers } from '@/hooks';
import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';

export const FundRequirementETH = (props: {
  serviceHash?: string;
  address: string;
  symbol: string;
  requirement: number;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
}) => {
  const { getETHBalance } = useEthers();
  return (
    <FundRequirement getBalance={getETHBalance} isERC20={false} {...props} />
  );
};
