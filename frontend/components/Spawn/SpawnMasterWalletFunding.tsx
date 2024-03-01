import { SpawnScreen } from '@/enums';
import { Funding } from './Funding/Funding';
import { FundRequirementETH } from './Funding/FundRequirement/FundRequirementETH';
import { useAppInfo, useSpawn } from '@/hooks';
import { useEffect, useMemo, useState } from 'react';
import { AddressNumberRecord } from '@/types';
import { Spin } from 'antd';
import EthersService from '@/service/Ethers';

export const SpawnMasterWalletFunding = ({
  nextPage,
}: {
  nextPage: SpawnScreen;
}) => {
  const { setSpawnData, rpc } = useSpawn();
  const { userPublicKey } = useAppInfo();

  const [masterWalletBalance, setMasterWalletBalance] = useState<
    number | undefined
  >();

  const masterWalletFundRequirements: AddressNumberRecord | undefined = useMemo(
    () =>
      userPublicKey
        ? {
            [userPublicKey]: 1,
          }
        : undefined,
    [userPublicKey],
  );

  const isMasterWalletFunded: boolean | undefined = useMemo(
    () =>
      userPublicKey &&
      masterWalletBalance !== undefined &&
      masterWalletFundRequirements
        ? masterWalletBalance >= masterWalletFundRequirements[userPublicKey]
        : undefined,
    [masterWalletBalance, masterWalletFundRequirements, userPublicKey],
  );

  useEffect(() => {
    userPublicKey &&
      EthersService.getEthBalance(userPublicKey, rpc).then(
        setMasterWalletBalance,
      );
  }, [rpc, userPublicKey]);

  // if not inital loaded, show loader
  if (
    masterWalletBalance === undefined ||
    isMasterWalletFunded === undefined ||
    masterWalletFundRequirements === undefined
  ) {
    return <Spin />;
  }

  // if master wallet is already funded, don't show the funding component, skip to next page
  if (isMasterWalletFunded) {
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
