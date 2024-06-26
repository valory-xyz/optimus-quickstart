import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Popover, PopoverProps, Typography } from 'antd';
import { formatUnits } from 'ethers/lib/utils';

import { COLOR, SERVICE_TEMPLATES, SUPPORT_URL } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';

const { Paragraph, Text } = Typography;

export const LOADING_MESSAGE =
  'Starting the agent may take a while, so feel free to minimize the app. We’ll notify you once it’s running. Please, don’t quit the app.';

const olasCostOfBond = Number(
  formatUnits(`${SERVICE_TEMPLATES[0].configuration.olas_cost_of_bond}`, 18),
);
const olasRequiredToStake = Number(
  formatUnits(
    `${SERVICE_TEMPLATES[0].configuration.olas_required_to_stake}`,
    18,
  ),
);

export const requiredOlas = olasCostOfBond + olasRequiredToStake;
export const requiredGas = Number(
  formatUnits(`${SERVICE_TEMPLATES[0].configuration.monthly_gas_estimate}`, 18),
);

export const cannotStartAgentText = (
  <Text style={{ color: COLOR.RED }}>
    Cannot start agent&nbsp;
    <InfoCircleOutlined />
  </Text>
);

export const otherPopoverProps: PopoverProps = {
  arrow: false,
  placement: 'bottomRight',
};

export const JoinOlasCommunity = () => (
  <div style={{ maxWidth: 340 }}>
    <Paragraph>
      Join the Olas community Discord server to report or stay up to date on the
      issue.
    </Paragraph>

    <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
      Olas community Discord server {UNICODE_SYMBOLS.EXTERNAL_LINK}
    </a>
  </div>
);

export const NoRewardsAvailablePopover = () => (
  <Popover
    {...otherPopoverProps}
    content={<JoinOlasCommunity />}
    title="No rewards available"
  >
    {cannotStartAgentText}
  </Popover>
);

export const NoJobsAvailablePopover = () => (
  <Popover
    {...otherPopoverProps}
    content={<JoinOlasCommunity />}
    title="No jobs available"
  >
    {cannotStartAgentText}
  </Popover>
);

const evictedDescription =
  "You didn't run your agent enough and it missed its targets multiple times. Please wait a few days and try to run your agent again.";
export const AgentEvictedPopover = () => (
  <Popover
    {...otherPopoverProps}
    content={<div style={{ maxWidth: 340 }}>{evictedDescription}</div>}
    title="Your agent was evicted"
  >
    {cannotStartAgentText}
  </Popover>
);

export const StartingButtonPopover = () => (
  <Popover
    trigger={['hover', 'click']}
    placement="bottomLeft"
    showArrow={false}
    content={
      <Flex vertical={false} gap={8} style={{ maxWidth: 260 }}>
        <Text>
          <InfoCircleOutlined style={{ color: COLOR.BLUE }} />
        </Text>
        <Text>{LOADING_MESSAGE}</Text>
      </Flex>
    }
  >
    <Button type="default" size="large" ghost disabled loading>
      Starting...
    </Button>
  </Popover>
);
