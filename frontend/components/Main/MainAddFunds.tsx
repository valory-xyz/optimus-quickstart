import {
  ArrowDownOutlined,
  CopyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Flex, message, QRCode, Typography } from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { copyToClipboard, truncateAddress } from '@/common-util';
import { useWallet } from '@/hooks';

export const MainAddFunds = () => {
  const { wallets } = useWallet();
  const [isAddFundsVisible, setIsAddFundsVisible] = useState(false);

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
    [walletAddress],
  );

  return (
    <>
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
      {isAddFundsVisible && (
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

          <Flex
            vertical
            style={{
              marginTop: 10,
              display: 'block',
              border: '1px solid black',
              borderRadius: '2.5px',
              padding: '5px',
            }}
          >
            <strong style={{ fontSize: 'medium', lineHeight: '0.9em' }}>
              No OLAS or XDAI on Gnosis Chain?
            </strong>
            <Link
              style={{
                fontSize: 'medium',
                textDecoration: 'underline',
                color: 'black',
              }}
              href={'https://swap.cow.fi/#/100/swap/WXDAI/OLAS'}
            >
              Get some on CowSwap
            </Link>
          </Flex>
        </Flex>
      )}
    </>
  );
};
