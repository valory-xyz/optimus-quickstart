import { Collapse, Flex, Typography } from 'antd';

import { CardSection } from '../styled/CardSection';

const collapseItems = [
  {
    key: 1,
    label: 'What are incentive programs?',
    children: (
      <Flex gap={2}>
        <Typography.Text>
          When your agent goes to work, it participates in staking contracts.
        </Typography.Text>
        <Typography.Text>
          Staking contracts define what the agent needs to do, how much OLAS
          needs to be staked etc.
        </Typography.Text>
        <Typography.Text>
          Your agent can only participate in one staking contract at a time.
        </Typography.Text>
        <Typography.Text>
          You need to run your agent for max 1 hour a day, regardless of the
          staking contract.
        </Typography.Text>
      </Flex>
    ),
  },
];

export const WhatAreIncentiveProgramsSection = () => {
  return (
    <CardSection>
      <Collapse items={collapseItems} />
    </CardSection>
  );
};
