import { SettingOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Flex } from 'antd';
import { useEffect } from 'react';

import { PageState } from '@/enums';
import { useBalance, usePageState, useServices } from '@/hooks';

import { MainAddFunds } from './MainAddFunds';
import { MainEarningsToday } from './MainEarningsToday';
import { MainGasBalance } from './MainGasBalance';
import { MainHeader } from './MainHeader';
import { MainNeedsFunds } from './MainNeedsFunds';
import { MainOlasBalance } from './MainOlasBalance';

export const Main = () => {
  const { goto } = usePageState();
  const { updateServicesState } = useServices();
  const { updateBalances, isLoaded, setIsLoaded } = useBalance();

  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      updateServicesState().then(() => updateBalances());
    }
  }, [isLoaded, setIsLoaded, updateBalances, updateServicesState]);

  return (
    <Card
      title={<MainHeader />}
      extra={
        <Button
          type="default"
          size="large"
          onClick={() => goto(PageState.Settings)}
        >
          <SettingOutlined />
        </Button>
      }
    >
      <Flex vertical gap={15}>
        <MainNeedsFunds />
        <MainOlasBalance />
        <MainGasBalance />
        <Divider />
        <MainEarningsToday />
        <Divider />
        <MainAddFunds />
      </Flex>
    </Card>
  );
};
