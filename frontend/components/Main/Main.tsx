import { SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { useEffect } from 'react';

import { PageState } from '@/enums';
import { useBalance, usePageState, useServices } from '@/hooks';

import { MainAddFunds } from './MainAddFunds';
import { MainGasBalance } from './MainGasBalance';
import { MainHeader } from './MainHeader';
import { MainNeedsFunds } from './MainNeedsFunds';
import { MainOlasBalance } from './MainOlasBalance';
import { MainTotalEarnings } from './MainTotalEarnings';

export const Main = () => {
  const { goto } = usePageState();
  const { updateServicesState } = useServices();
  const { updateBalances, isLoaded, setIsLoaded } = useBalance();

  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      updateServicesState()
        .then(() => updateBalances())
        .catch(() => setIsLoaded(false));
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
        <MainTotalEarnings />
        <MainGasBalance />
        <MainAddFunds />
      </Flex>
    </Card>
  );
};
