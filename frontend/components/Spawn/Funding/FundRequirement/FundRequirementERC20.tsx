import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';
import { Address, AddressBooleanRecord } from '@/types';
import EthersService from '@/service/Ethers';

type FundRequirementERC20Props = {
  address: Address;
  requirement: number;
  rpc: string;
  symbol: string;
  contractAddress?: Address;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<AddressBooleanRecord>>;
};

export const FundRequirementERC20 = (props: FundRequirementERC20Props) => {
  return (
    <FundRequirement
      getBalance={EthersService.getErc20Balance}
      isErc20={true}
      {...props}
    />
  );
};
