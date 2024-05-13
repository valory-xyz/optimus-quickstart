import { CopyOutlined, QrcodeOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Flex,
  message,
  Popover,
  QRCode,
  Tooltip,
  Typography,
} from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { copyToClipboard, truncateAddress } from '@/common-util';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';
import { Address } from '@/types';

import { CardSection } from '../styled/CardSection';

const CustomizedCardSection = styled(CardSection)<{ border?: boolean }>`
  > .ant-btn {
    width: 50%;
  }
`;

export const MainAddFunds = () => {
  const { wallets } = useBalance();
  const [isAddFundsVisible, setIsAddFundsVisible] = useState(false);

  const walletAddress = useMemo(() => wallets[0]?.address, [wallets]);

  const truncatedWalletAddress = useMemo(
    () => truncateAddress(walletAddress),
    [walletAddress],
  );

  const handleCopyWalletAddress = useCallback(
    () =>
      copyToClipboard(walletAddress).then(() =>
        message.success('Copied successfully!'),
      ),
    [walletAddress],
  );

  return (
    <>
      <CustomizedCardSection vertical={false} border gap={12}>
        <Button
          type="default"
          size="large"
          onClick={() => setIsAddFundsVisible((prev) => !prev)}
        >
          {isAddFundsVisible ? 'Close instructions' : 'Add funds'}
        </Button>
        <Button type="default" size="large" disabled>
          Withdraw
        </Button>
      </CustomizedCardSection>

      {isAddFundsVisible && (
        <>
          <AddFundsWarningAlertSection />
          <AddFundsAddressSection
            truncatedWalletAddress={truncatedWalletAddress}
            walletAddress={walletAddress}
            handleCopy={handleCopyWalletAddress}
          />
          <AddFundsGetTokensSection />
        </>
      )}
    </>
  );
};

const AddFundsWarningAlertSection = () => (
  <CardSection>
    <Alert
      className="card-section-alert"
      type="warning"
      showIcon
      message={
        <Flex vertical gap={2.5}>
          <Typography.Text className="text-base" strong>
            Only send funds on Gnosis Chain!
          </Typography.Text>
          <Typography.Text className="text-base">
            You will lose any assets you send on other chains.
          </Typography.Text>
        </Flex>
      }
    />
  </CardSection>
);

const AddFundsAddressSection = ({
  walletAddress,
  truncatedWalletAddress,
  handleCopy,
}: {
  walletAddress: Address;
  truncatedWalletAddress: string;
  handleCopy: () => void;
}) => (
  <CardSection gap={10} justify="center" align="center">
    <Tooltip
      title={<span className="can-select-text flex">{walletAddress}</span>}
    >
      <Typography.Text title={walletAddress}>
        GNO: {truncatedWalletAddress}
      </Typography.Text>
    </Tooltip>
    <Button onClick={handleCopy}>
      <CopyOutlined />
    </Button>
    <Popover
      title="Scan QR code"
      content={
        <QRCode
          size={250}
          value={`https://metamask.app.link/send/${walletAddress}@${100}`}
        />
      }
    >
      <Button>
        <QrcodeOutlined />
      </Button>
    </Popover>
  </CardSection>
);

const AddFundsGetTokensSection = () => (
  <CardSection border justify="center">
    <Link target="_blank" href={'https://swap.cow.fi/#/100/swap/WXDAI/OLAS'}>
      Get OLAS + XDAI on Gnosis Chain {UNICODE_SYMBOLS.EXTERNAL_LINK}
    </Link>
  </CardSection>
);
