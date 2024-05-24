import { Flex, Typography } from 'antd';

import { DeploymentStatus } from '@/client';
import { useServices } from '@/hooks';
import { useStore } from '@/hooks/useStore';

import { Alert } from '../common/Alert';
import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

export const KeepAgentRunning = () => {
  const { storeState } = useStore();
  const { serviceStatus } = useServices();

  const rewardsEarnedOnce = storeState?.rewardsEarnedOnce;

  if (rewardsEarnedOnce) return false;
  if (serviceStatus !== DeploymentStatus.DEPLOYED) return;

  return (
    <CardSection>
      <Alert
        type="info"
        fullWidth
        showIcon
        message={
          <Flex vertical>
            <Text>Your agent has not hit its target yet.</Text>
            <Text>Keep the agent running to earn today’s rewards.</Text>
          </Flex>
        }
      />
    </CardSection>
  );
};
