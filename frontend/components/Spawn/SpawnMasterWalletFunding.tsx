import { SpawnScreen } from '@/enums';
import { Funding } from './Funding/Funding';
import { FundRequirementETH } from './Funding/FundRequirement/FundRequirementETH';
import { useAppInfo, useSpawn } from '@/hooks';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import EthersService from '@/service/Ethers';

export const SpawnMasterWalletFunding = ({
  nextPage,
}: {
  nextPage: SpawnScreen;
}) => {
  const { setSpawnData, rpc, masterWalletFundRequirements } = useSpawn();
  const { userPublicKey } = useAppInfo();
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    if (!isInitialLoaded && userPublicKey) {
      EthersService.getEthBalance(userPublicKey, rpc).then((balance) => {
        setSpawnData((prev) => ({
          ...prev,
          masterWalletFundRequirements: {
            ...prev,
            [userPublicKey]: {
              ...masterWalletFundRequirements[userPublicKey],
              received:
                balance >= masterWalletFundRequirements[userPublicKey].required,
            },
          },
        }));
        setIsInitialLoaded(true);
      });
    }
  }, [
    isInitialLoaded,
    masterWalletFundRequirements,
    rpc,
    setSpawnData,
    userPublicKey,
  ]);

  // if not inital loaded, show loader
  if (masterWalletFundRequirements === undefined || !isInitialLoaded) {
    return <Spin />;
  }

  // if master wallet is already funded, don't show the funding component, skip to next page
  if (userPublicKey && masterWalletFundRequirements[userPublicKey].received) {
    setSpawnData((prev) => ({ ...prev, screen: nextPage }));
    return <></>;
  }

  return (
    <Funding
      statement="Please fund your master wallet to continue."
      fundRequirements={masterWalletFundRequirements}
      FundRequirementComponent={FundRequirementETH}
      symbol={'XDAI'} // hardcoded while only trader is available
      nextPage={nextPage}
    />
  );
};
