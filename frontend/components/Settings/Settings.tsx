import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, message, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { PageState, SettingsScreen } from '@/enums';
import { usePageState } from '@/hooks';
import { useSettings } from '@/hooks/useSettings';

import { CardTitle } from '../common/CardTitle';
import { SettingsAddBackupWallet } from './SettingsAddBackupWallet';

export const Settings = () => {
  const { screen } = useSettings();
  const settingsScreen = useMemo(() => {
    switch (screen) {
      case SettingsScreen.Main:
        return <SettingsMain />;
      case SettingsScreen.AddBackupWallet:
        return <SettingsAddBackupWallet />;
    }
  }, [screen]);

  return settingsScreen;
};

const SettingsMain = () => {
  const { goto } = usePageState();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = () => {
    if (isUpdating) handleSave();
    setIsUpdating((prev) => !prev);
  };

  const handleSave = () => {
    message.success('Password updated!');
  };

  return (
    <Card
      title={
        <CardTitle
          title={
            <>
              <SettingOutlined />
              Settings
            </>
          }
        />
      }
      extra={
        <Button type="text" size="large" onClick={() => goto(PageState.Main)}>
          <CloseOutlined />
        </Button>
      }
    >
      <Flex justify="space-between" align="center">
        <Flex gap={5} vertical>
          <Typography.Text>Password</Typography.Text>
          {isUpdating ? (
            <Input.Password></Input.Password>
          ) : (
            <Typography.Text>********</Typography.Text>
          )}
        </Flex>
        <Button disabled onClick={handleClick}>
          {isUpdating ? 'Save' : 'Update'}
        </Button>
      </Flex>
    </Card>
  );
};
