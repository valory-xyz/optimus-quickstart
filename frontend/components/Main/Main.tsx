import { ArrowDownOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import { useState } from 'react';

import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

import { MainAddFunds } from './MainAddFunds';
import { MainGasBalance } from './MainGasBalance';
import { MainHeader } from './MainHeader';
import { MainOlasBalance } from './MainOlasBalance';
import { MainTotalEarnings } from './MainTotalEarnings';

export const Main = () => {
  const { goto } = usePageState();
  const [isAddFundsVisible, setIsAddFundsVisible] = useState(false);
  return (
    <Card
      title={<MainHeader />}
      extra={
        <Button
          type="text"
          style={{ marginLeft: 'auto' }}
          onClick={() => goto(PageState.Settings)}
        >
          <SettingOutlined />
        </Button>
      }
    >
      <Flex vertical>
        <MainOlasBalance />
        <MainTotalEarnings />
        <MainGasBalance />
        <Flex>
          <Button
            type="default"
            onClick={() => setIsAddFundsVisible((prev) => !prev)}
            style={{ marginTop: 20, marginBottom: 20 }}
            icon={<ArrowDownOutlined />}
          >
            Add Funds
          </Button>
        </Flex>
        {isAddFundsVisible && <MainAddFunds />}
      </Flex>
    </Card>
  );
};
