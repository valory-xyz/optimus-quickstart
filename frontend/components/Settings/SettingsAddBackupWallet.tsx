import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography } from 'antd';
import { useMemo } from 'react';

import { Chain } from '@/client';
import { MIN_ETH_BALANCE_THRESHOLDS } from '@/constants';
import { SettingsScreen } from '@/enums';
import { useBalance } from '@/hooks';
import { useSettings } from '@/hooks/useSettings';

import { CardTitle } from '../common/CardTitle';
import { CardFlex } from '../styled/CardFlex';

export const SettingsAddBackupWallet = () => {
  const { totalEthBalance } = useBalance();
  const { goto } = useSettings();

  const [form] = Form.useForm();

  const isFunded = useMemo<boolean>(() => {
    if (!totalEthBalance) return false;
    return (
      totalEthBalance >= MIN_ETH_BALANCE_THRESHOLDS[Chain.GNOSIS].safeAddSigner
    );
  }, [totalEthBalance]);

  return (
    <CardFlex
      title={<CardTitle title="Add backup wallet" />}
      extra={
        <Button size="large" onClick={() => goto(SettingsScreen.Main)}>
          <CloseOutlined />
        </Button>
      }
    >
      <Typography.Paragraph>
        To keep your funds safe, we encourage you to add one of your existing
        crypto wallets as a backup. This enables you to recover your funds if
        you lose both your password and seed phrase.
      </Typography.Paragraph>
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Backup wallet address"
          name="backup-wallet-address"
          rules={[
            {
              required: true,
              min: 42,
              pattern: /^0x[a-fA-F0-9]{40}$/,
              type: 'string',
              message: 'Please input a valid backup wallet address!',
            },
          ]}
        >
          <Input placeholder="e.g. 0x123124...124124" size="large" />
        </Form.Item>
        <Button type="primary" disabled={!isFunded} htmlType="submit">
          Add backup wallet
        </Button>
      </Form>
      <Typography.Text>
        <small className="text-muted">
          * This action requires a small amount of funds.
        </small>
      </Typography.Text>
    </CardFlex>
  );
};
