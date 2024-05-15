import { CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography } from 'antd';
import { useMemo } from 'react';

import { Chain } from '@/client';
import { MIN_ETH_BALANCE_THRESHOLDS } from '@/constants';
import { useBalance } from '@/hooks';

import { CardTitle } from '../common/CardTitle';
import { CardFlex } from '../styled/CardFlex';

export const SettingsAddBackupWallet = () => {
  const { totalEthBalance } = useBalance();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isFunded = useMemo<boolean>(() => {
    if (!totalEthBalance) return false;
    return (
      totalEthBalance > MIN_ETH_BALANCE_THRESHOLDS[Chain.GNOSIS].safeAddSigner
    );
  }, [totalEthBalance]);

  return (
    <CardFlex
      title={<CardTitle title="Add backup wallet" />}
      extra={
        <Button size="large">
          <CloseOutlined />
        </Button>
      }
    >
      <Typography.Text>
        To keep your funds safe, we encourage you to add one of your existing
        crypto wallets as a backup. This enables you to recover your funds if
        you lose both your password and seed phrase.
      </Typography.Text>
      <Form>
        <Form.Item label="Backup wallet address">
          <Input
            name="backup-wallet-address"
            placeholder="e.g. 0x123124...124124"
            size="large"
          />
        </Form.Item>
        <Button type="primary" disabled={!isFunded}>
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
