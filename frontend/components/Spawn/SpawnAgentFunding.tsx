import { Funding } from './Funding/Funding';
import { SpawnScreen } from '@/enums';
import { FundRequirementETH } from './Funding/FundRequirement/FundRequirementETH';
import { useAppInfo, useSpawn } from '@/hooks';
import { Spin } from 'antd';
import { useState, useEffect } from 'react';
import MulticallService from '@/service/Multicall';
import { Address, AddressNumberRecord } from '@/types';

type SpawnAgentFundingProps = {
  nextPage: SpawnScreen;
};

export const SpawnAgentFunding = (props: SpawnAgentFundingProps) => {
  const {
    setSpawnData,
    spawnData: { rpc, agentFundRequirements },
  } = useSpawn();
  const { userPublicKey } = useAppInfo();
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialLoaded && userPublicKey) {
      const agentAddresses = Object.keys(agentFundRequirements) as Address[];
      MulticallService.getEthBalances(agentAddresses, rpc).then(
        (balances: AddressNumberRecord) => {
          setSpawnData((prev) => ({
            ...prev,
            agentFundRequirements: agentAddresses.reduce(
              (acc, address) => ({
                ...acc,
                [address]: {
                  ...agentFundRequirements[address],
                  received: balances[address] > 1,
                },
              }),
              {},
            ),
          }));
          setIsInitialLoaded(true);
        },
      );
    }
  }, [
    agentFundRequirements,
    isInitialLoaded,
    rpc,
    setSpawnData,
    userPublicKey,
  ]);

  // if not inital loaded, show loader
  if (agentFundRequirements === undefined || !isInitialLoaded) {
    return <Spin />;
  }

  return (
    <Funding
      fundRequirements={agentFundRequirements}
      statement="Please fund the agent wallets to continue."
      symbol={'XDAI'} // hardcoded while only trader is available
      FundRequirementComponent={FundRequirementETH}
      {...props}
    />
  );
};
