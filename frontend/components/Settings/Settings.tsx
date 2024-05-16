import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, message, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { PageState, SettingsScreen } from '@/enums';
import { usePageState } from '@/hooks';
import { useSettings } from '@/hooks/useSettings';

import { CardTitle } from '../common/CardTitle';
import { CardSection } from '../styled/CardSection';
import { SettingsAddBackupWallet } from './SettingsAddBackupWallet';

export const Settings = () => {
  const { screen } = useSettings();
  const settingsScreen = useMemo(() => {
    switch (screen) {
      case SettingsScreen.Main:
        return <SettingsMain />;
      case SettingsScreen.AddBackupWallet:
        return <SettingsAddBackupWallet />;
      default:
        return null;
    }
  }, [screen]);

  return settingsScreen;
};

const SettingsMain = () => {
  const { goto } = usePageState();
  const { goto: gotoSettings } = useSettings();

  // TODO: implement safe owners count

  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = () => {
    if (isUpdating) handleSave();
    setIsUpdating((prev) => !prev);
  };

  const handleSave = () => {
    // TODO: implement password update
    message.success('Password updated!');
  };

  return (
    <Card
      title={
        <CardTitle
          title={
            <Flex gap={10}>
              <SettingOutlined />
              Settings
            </Flex>
          }
        />
      }
      extra={
        <Button type="text" size="large" onClick={() => goto(PageState.Main)}>
          <CloseOutlined />
        </Button>
      }
    >
      <CardSection borderBottom justify="space-between" align="center">
        <Flex vertical>
          <Typography.Paragraph strong>Password</Typography.Paragraph>
          {isUpdating ? (
            <Input.Password />
          ) : (
            <Typography.Text>********</Typography.Text>
          )}
        </Flex>
        <Button disabled onClick={handleClick}>
          {isUpdating ? 'Save' : 'Update'}
        </Button>
      </CardSection>

      <CardSection vertical gap={10}>
        <Typography.Paragraph strong>Backup wallet</Typography.Paragraph>
        <Button
          type="primary"
          size="large"
          disabled={true} // not in this iteration?
          onClick={() => gotoSettings(SettingsScreen.AddBackupWallet)}
        >
          Add backup wallet
        </Button>
      </CardSection>
    </Card>
  );
};
