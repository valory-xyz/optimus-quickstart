import { CopyOutlined } from '@ant-design/icons';
import {
  Alert,
  AlertProps,
  Button,
  Flex,
  message,
  QRCode,
  Typography,
} from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

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
      <Button
        type="default"
        size="large"
        onClick={() => setIsAddFundsVisible((prev) => !prev)}
      >
        {isAddFundsVisible ? 'Close' : 'Add Funds'}
      </Button>
      {isAddFundsVisible && (
        <Flex vertical align="center" gap={20}>
          <Alert
            type="warning"
            showIcon
            message={
              <Flex vertical gap={5}>
                <Typography.Text className="text-base" strong>
                  Only send assets on Gnosis
                </Typography.Text>
                <Typography.Text className="text-base">
                  You will lose any assets you send on other chains.
                </Typography.Text>
              </Flex>
            }
          />
          <QRCode
            size={250}
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

          <NoFundsAlert
            message={
              <Flex vertical>
                <Typography.Text className="text-base" strong>
                  No OLAS or XDAI on Gnosis Chain?
                </Typography.Text>
                <Link
                  target="_blank"
                  href={'https://swap.cow.fi/#/100/swap/WXDAI/OLAS'}
                >
                  Get some on CowSwap {UNICODE_SYMBOLS.EXTERNAL_LINK}
                </Link>
              </Flex>
            }
          />
        </Flex>
      )}
    </>
  );
};

const NoFundsAlert = styled(Alert)<AlertProps>`
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;

  a {
    text-decoration: underline;
    color: black;
  }
`;
