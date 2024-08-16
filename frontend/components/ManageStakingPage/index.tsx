import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';

import { Chain } from '@/client';
import { SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT_ADDRESSES } from '@/constants/contractAddresses';
import { Pages } from '@/enums/PageState';
import { StakingProgram } from '@/enums/StakingProgram';
import { usePageState } from '@/hooks/usePageState';

import { CardTitle } from '../Card/CardTitle';
import { StakingContractSection } from './StakingContract';
import { WhatAreStakingContractsSection } from './WhatAreStakingContracts';

// const mockStakingContracts: StakingProgram[] = [
//   {
//     name: 'Pearl Beta',
//     rewardsPerWorkPeriod: 0.14,
//     requiredOlasForStaking: 40,
//     isEnoughSlots: true,
//     status: StakingProgramStatus.New,
//     contractAddress: '0x1234567890',
//   },
//   {
//     name: 'Pearl Alpha',
//     rewardsPerWorkPeriod: 0.047,
//     requiredOlasForStaking: 20,
//     isEnoughSlots: true,
//     status: StakingProgramStatus.Selected,
//     contractAddress: '0x0987654321',
//   },
// ];

export const ManageStakingPage = () => {
  const { goto } = usePageState();
  return (
    <Card
      title={<CardTitle title="Manage staking contract" />}
      bordered={false}
      extra={
        <Button
          size="large"
          icon={<CloseOutlined />}
          onClick={() => goto(Pages.Main)}
        />
      }
    >
      <WhatAreStakingContractsSection />
      {Object.entries(
        SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT_ADDRESSES[Chain.GNOSIS],
      ).map(([stakingProgram, contractAddress]) => (
        <StakingContractSection
          key={contractAddress}
          stakingProgram={stakingProgram as StakingProgram}
          contractAddress={contractAddress}
        />
      ))}
    </Card>
  );
};
