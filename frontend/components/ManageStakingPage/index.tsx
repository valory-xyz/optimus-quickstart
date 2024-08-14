import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';

import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';
import { Pages } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';
import { IncentiveProgram } from '@/types/IncentiveProgram';

import { CardTitle } from '../Card/CardTitle';
import { StakingContract } from './StakingContract';
import { WhatAreStakingContractsSection } from './WhatAreStakingContracts';

const mockStakingContracts: IncentiveProgram[] = [
  {
    name: 'Pearl Beta',
    rewardsPerWorkPeriod: 0.14,
    requiredOlasForStaking: 40,
    isEnoughSlots: true,
    status: IncentiveProgramStatus.New,
    contractAddress: '0x1234567890',
  },
  {
    name: 'Pearl Alpha',
    rewardsPerWorkPeriod: 0.047,
    requiredOlasForStaking: 20,
    isEnoughSlots: true,
    status: IncentiveProgramStatus.Selected,
    contractAddress: '0x0987654321',
  },
];

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
      {mockStakingContracts.map((contract) => (
        <StakingContract key={contract.contractAddress} contract={contract} />
      ))}
    </Card>
  );
};
