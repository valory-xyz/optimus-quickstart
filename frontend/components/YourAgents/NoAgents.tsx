import { Tab } from '@/enums';
import { useTabs } from '@/hooks';
import { Flex, Typography, Button } from 'antd';

export const NoAgents = (): JSX.Element => {
  const { setActiveTab } = useTabs();
  return (
    <Flex vertical justify="center" align="center">
      <Typography.Text>No agents running.</Typography.Text>
      <Button type="primary" onClick={() => setActiveTab(Tab.MARKETPLACE)}>
        Browse Agents
      </Button>
    </Flex>
  );
};
