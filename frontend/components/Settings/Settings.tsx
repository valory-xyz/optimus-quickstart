import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Typography } from 'antd';
import Link from 'next/link';
import { useMemo } from 'react';

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

const { Text, Paragraph } = Typography;

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

  const truncatedBackupSafeAddress: string | undefined = useMemo(() => {
    if (backupSafeAddress) {
      return truncateAddress(backupSafeAddress);
    }
  }, [backupSafeAddress]);

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
          <Paragraph strong>Password</Paragraph>
          <Text>********</Text>
        </Flex>
      </CardSection>

      <CardSection vertical gap={24}>
        <Text strong>Backup wallet</Text>
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
      <Text type="secondary">No backup wallet added.</Text>
      <CardSection>
        <Alert
          type="warning"
          className="card-section-alert"
          showIcon
          message={
            <>
              <Flex vertical gap={5}>
                <Text strong style={{ color: COLOR.BROWN }}>
                  Your funds are at risk!
                </Text>
                <Text style={{ color: COLOR.BROWN }}>
                  You will lose any assets you send on other chains.
                </Text>
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
