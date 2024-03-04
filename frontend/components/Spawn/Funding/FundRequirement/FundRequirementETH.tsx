import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';
import { Address, AddressBooleanRecord } from '@/types';
import EthersService from '@/service/Ethers';

type FundRequirementETHProps = {
  address: Address;
  symbol: string;
  requirement: number;
  rpc: string;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<AddressBooleanRecord>>;
};

export const FundRequirementETH = (props: FundRequirementETHProps) => {
  return (
    <FundRequirement
      getBalance={EthersService.getEthBalance}
      isErc20={false}
      {...props}
    />
  );
};
