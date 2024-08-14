import { Button, Flex, Typography } from 'antd';

import { Pages } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';

import { CustomAlert } from '../../Alert';
import { CardSection } from '../../styled/CardSection';

const { Text } = Typography;

export const NewIncentiveAlert = () => {
  const { goto } = usePageState();

  return (
    <CardSection>
      <CustomAlert
        type="info"
        fullWidth
        showIcon
        message={
          <Flex vertical>
            <Text>A new incentive program is available for your agent!</Text>
            <Button
              type="primary"
              size="large"
              onClick={() => goto(Pages.ManageStaking)}
            >
              Review incentive program
            </Button>
          </Flex>
        }
      />
    </CardSection>
  );
};
