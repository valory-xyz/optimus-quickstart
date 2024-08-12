import { RightOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';

import { CardSection } from '../styled/CardSection';

export const WhatAreIncentiveProgramsSection = () => {
  return (
    <CardSection>
      <Flex gap={2}>
        <RightOutlined />
        <Typography.Text>What are incentive programs?</Typography.Text>
      </Flex>
    </CardSection>
  );
};
