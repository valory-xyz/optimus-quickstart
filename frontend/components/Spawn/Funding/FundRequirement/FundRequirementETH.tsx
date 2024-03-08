import { Dispatch, SetStateAction } from 'react';
import { FundRequirement } from './FundRequirement';
import { Address, SpawnData } from '@/types';
import { EthersService } from '@/service';

type FundRequirementETHProps = {
  address: Address;
  symbol: string;
  requirement: number;
  rpc: string;
  hasReceivedFunds: boolean;
  setSpawnData: Dispatch<SetStateAction<SpawnData>>;
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
