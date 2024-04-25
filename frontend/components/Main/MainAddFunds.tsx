import {
  ArrowDownOutlined,
  CloseOutlined,
  CopyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Flex, message, QRCode, Typography } from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { copyToClipboard, truncateAddress } from '@/common-util';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
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
          icon={isAddFundsVisible ? <CloseOutlined /> : <ArrowDownOutlined />}
        >
          {isAddFundsVisible ? 'Close' : 'Add Funds'}
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
                  Only send assets on Gnosis
                </Typography.Text>
                <Typography.Text style={{ fontSize: 16 }}>
                  You will lose any assets you send on other chains.
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
              border: '1px solid lightgrey',
              borderRadius: '2.5px',
              padding: 10,
              gap: 10,
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
              target="_blank"
              href={'https://swap.cow.fi/#/100/swap/WXDAI/OLAS'}
            >
              Get some on CowSwap {UNICODE_SYMBOLS.EXTERNAL_LINK}
            </Link>
          </Flex>
        </Flex>
      )}
    </>
  );
};
