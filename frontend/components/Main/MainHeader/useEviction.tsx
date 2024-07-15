import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Popover, Typography } from 'antd';

import { COLOR } from '@/constants/colors';

const { Text } = Typography;

const AgentCannotUnstake = () => (
  <Popover
    trigger={['hover', 'click']}
    placement="bottomLeft"
    showArrow={false}
    content={
      <Flex vertical={false} gap={8} style={{ maxWidth: 260 }}>
        <Text>
          <InfoCircleOutlined style={{ color: COLOR.BLUE }} />
        </Text>
        {/* TODO: ask copy from Roman */}
        <Text>
          Agent cannot be staked until some date from backend or calculate in UI
        </Text>
      </Flex>
    }
  >
    <Button type="default" size="large" disabled loading>
      Start agent
    </Button>
  </Popover>
);

const CanStartAgent = () => {
  const handleStartAgent = () => null; // TODO

  return (
    <Popover
      trigger={['hover', 'click']}
      placement="bottomLeft"
      showArrow={false}
      content={
        <Flex vertical={false} gap={8} style={{ maxWidth: 260 }}>
          <Text>
            <InfoCircleOutlined style={{ color: COLOR.BLUE }} />
          </Text>
          {/* TODO: ask copy from Roman */}
          <Text>Agent can be staked</Text>
        </Flex>
      }
    >
      <Button type="primary" size="large" onClick={handleStartAgent}>
        Unstake and start agent
      </Button>
    </Popover>
  );
};

export const useEviction = () => {
  const isEvicted = true; // TODO
  const isMinStakingDurationMet = true; // TODO

  if (isEvicted) {
    if (isMinStakingDurationMet) {
      return {
        isEvicted: true,
        canStartAgent: true,
        component: <CanStartAgent />,
      };
    }

    return {
      isEvicted: true,
      canStartAgent: false,
      component: <AgentCannotUnstake />,
    };
  }

  // scenario 1: agent is evicted and min staking duration is NOT met
  // ie, user CANNOT start the agent

  // scenario 2: agent is evicted and min staking duration is met
  // ie, user CAN start the agent

  // return {
  //   isEvicted: false,
  //   canStartAgent: true,
  //   message: 'Eviction message',
  // };

  // no eviction
  return {
    isEvicted: false,
    canStartAgent: true,
    component: null,
  };
};
