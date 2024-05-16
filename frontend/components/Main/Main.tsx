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
import { MainRewards } from './MainRewards';

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
      style={{ borderTopColor: 'transparent' }}
    >
      <Flex vertical>
        <MainNeedsFunds />
        <MainOlasBalance />
        <MainRewards />
        <MainGasBalance />
        <MainAddFunds />
      </Flex>
    </Card>
  );
};
