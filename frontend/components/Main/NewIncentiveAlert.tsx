import { Button, Flex, Typography } from 'antd';

import { PageState } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';

import { Alert } from '../Alert';
import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

export const NewIncentiveAlert = () => {
  const { goto } = usePageState();

  return (
    <CardSection>
      <Alert
        type="info"
        fullWidth
        showIcon
        message={
          <Flex vertical>
            <Text>A new incentive program is available for your agent!</Text>
            <Button
              type="primary"
              size="large"
              onClick={() => goto(PageState.MainIncentiveProgram)}
            >
              Review incentive program
            </Button>
          </Flex>
        }
      />
    </CardSection>
  );
};
