import { SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';

import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

import { MainAddFunds } from './MainAddFunds';
import { MainGasBalance } from './MainGasBalance';
import { MainHeader } from './MainHeader';
import { MainNeedsFunds } from './MainNeedsFunds';
import { MainOlasBalance } from './MainOlasBalance';

export const Main = () => {
  const { goto } = usePageState();
  return (
    <Card
      title={<MainHeader />}
      extra={
        <Button type="text" onClick={() => goto(PageState.Settings)}>
          <SettingOutlined />
        </Button>
      }
    >
      <a href="https://google.com">Test</a>
      <Flex vertical>
        <MainOlasBalance />
        {/* <MainTotalEarnings /> */}
        <MainGasBalance />
        <MainNeedsFunds />
        <MainAddFunds />
      </Flex>
    </Card>
  );
};
