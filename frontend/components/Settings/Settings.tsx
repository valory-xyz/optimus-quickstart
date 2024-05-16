import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Input, message, Typography } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { truncateAddress } from '@/common-util';
import { COLOR } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { PageState, SettingsScreen } from '@/enums';
import { usePageState } from '@/hooks';
import { useMasterSafe } from '@/hooks/useMasterSafe';
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
  const { backupSafeAddress } = useMasterSafe();
  const { goto } = usePageState();
  const { goto: gotoSettings } = useSettings();

  const [isUpdating, setIsUpdating] = useState(false);

  const truncatedBackupSafeAddress: string | undefined = useMemo(() => {
    if (backupSafeAddress) {
      return truncateAddress(backupSafeAddress);
    }
  }, [backupSafeAddress]);

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
        {/* Currently disabled as the later `handleSave` is not implemented yet */}
        <Button disabled onClick={handleClick}>
          {isUpdating ? 'Save' : 'Update'}
        </Button>
      </CardSection>

      <CardSection vertical gap={24}>
        <Typography.Text strong>Backup wallet</Typography.Text>
        {backupSafeAddress ? (
          <Link
            type="link"
            target="_blank"
            href={`https://gnosisscan.io/address/${backupSafeAddress}`}
          >
            {truncatedBackupSafeAddress} {UNICODE_SYMBOLS.EXTERNAL_LINK}
          </Link>
        ) : (
          <NoBackupWallet />
        )}
      </CardSection>
    </Card>
  );
};

const NoBackupWallet = () => {
  const { goto: gotoSettings } = useSettings();
  return (
    <>
      <Typography.Text type="secondary">
        No backup wallet added.
      </Typography.Text>
      <CardSection>
        <Alert
          type="warning"
          className="card-section-alert"
          showIcon
          message={
            <>
              <Flex vertical gap={5}>
                <Typography.Text strong style={{ color: COLOR.BROWN }}>
                  Your funds are at risk!
                </Typography.Text>
                <Typography.Text style={{ color: COLOR.BROWN }}>
                  You will lose any assets you send on other chains.
                </Typography.Text>
              </Flex>
            </>
          }
        />
      </CardSection>
      <Button
        type="primary"
        size="large"
        disabled={true} // not in this iteration?
        onClick={() => gotoSettings(SettingsScreen.AddBackupWallet)}
      >
        Add backup wallet
      </Button>
    </>
  );
};
