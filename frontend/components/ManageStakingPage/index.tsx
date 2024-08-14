import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';

import { Pages } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';
import { IncentiveProgram } from '@/types/IncentiveProgram';

import { CardTitle } from '../Card/CardTitle';
import { IncentiveProgramSection } from './IncentiveProgramSection';
import { WhatAreIncentiveProgramsSection } from './WhatAreIncentivePrograms';

const IncentivesTitle = () => {
  return (
    <CardTitle
      title={
        <Flex gap={10}>
          <SettingOutlined />
          Settings
        </Flex>
      }
    />
  );
};

const mockIncentivePrograms: IncentiveProgram[] = [
  {
    name: 'Incentive Program 1',
    rewardsPerWorkPeriod: 100,
    requiredOlasForStaking: 1000,
    contractAddress: '0x1234567890',
  },
  {
    name: 'Incentive Program 2',
    rewardsPerWorkPeriod: 200,
    requiredOlasForStaking: 2000,
    contractAddress: '0x0987654321',
  },
];

export const Incentives = () => {
  const { goto } = usePageState();
  return (
    <Card
      title={<IncentivesTitle />}
      extra={
        <Button
          size="large"
          icon={<CloseOutlined />}
          onClick={() => goto(Pages.Main)}
        />
      }
    >
      <WhatAreIncentiveProgramsSection />
      {mockIncentivePrograms.map((program) => (
        <IncentiveProgramSection
          key={program.contractAddress}
          program={program}
        />
      ))}
    </Card>
  );
};
