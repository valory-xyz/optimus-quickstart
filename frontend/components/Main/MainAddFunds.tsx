import { CopyOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, App, Button, Flex, QRCode, Typography } from 'antd';
import { useCallback, useMemo } from 'react';

import { copyToClipboard, truncateAddress } from '@/common-util';
import { useWallet } from '@/hooks';

export const MainAddFunds = () => {
  const { message } = App.useApp();
  const { wallets } = useWallet();

  const walletAddress = useMemo(() => wallets[0]?.address, [wallets]);
  const truncatedWalletAddress = useMemo(
    () => truncateAddress(walletAddress),
    [walletAddress],
  );

  const handleCopy = useCallback(
    () =>
      copyToClipboard(walletAddress).then(() =>
        message.success('Copied successfully!'),
      ),
    [message, walletAddress],
  );

  return (
    <>
      <Flex vertical align="center" gap={20}>
        <Alert
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          message={
            <Flex vertical gap={5}>
              <Typography.Text style={{ fontSize: 16 }} strong>
                Only send assets on Gnosis Chain!
              </Typography.Text>
              <Typography.Text style={{ fontSize: 16 }}>
                You will lose any assets you send on other chains
              </Typography.Text>
            </Flex>
          }
        />
        <QRCode
          value={`https://metamask.app.link/send/${walletAddress}@${100}`}
        />
        <Flex gap={10}>
          <Typography.Text
            className="can-select-text"
            code
            title={walletAddress}
          >
            {truncatedWalletAddress}
          </Typography.Text>
          <Button onClick={handleCopy}>
            <CopyOutlined />
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
