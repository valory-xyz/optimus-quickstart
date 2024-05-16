import {
  CopyOutlined,
  QrcodeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
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
import { COLOR, COW_SWAP_GNOSIS_XDAI_OLAS_URL } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';
import { Address } from '@/types';

import { CardSection } from '../styled/CardSection';
import { useNeedsFunds } from './MainNeedsFunds';

const { Text } = Typography;

const CustomizedCardSection = styled(CardSection)<{ border?: boolean }>`
  > .ant-btn {
    width: 50%;
  }
`;

const useAddFunds = () => {
  const { setHeight, setFullHeight } = useElectronApi();
  const { hasEnoughEth, hasEnoughOlas } = useNeedsFunds();

  const [isAddFundsVisible, setIsAddFundsVisible] = useState(false);

  const toggleAddFunds = useCallback(() => {
    setIsAddFundsVisible((prev) => !prev);

    if (!isAddFundsVisible) {
      setFullHeight?.();
    } else if (!hasEnoughEth && !hasEnoughOlas) {
      setHeight?.(580);
    } else if (!hasEnoughEth || !hasEnoughOlas) {
      setHeight?.(580);
    } else {
      setHeight?.(475);
    }
  }, [
    isAddFundsVisible,
    hasEnoughEth,
    hasEnoughOlas,
    setFullHeight,
    setHeight,
  ]);

  return {
    isAddFundsVisible,
    toggleAddFunds,
  };
};

export const MainAddFunds = () => {
  const { wallets } = useBalance();
  const { isAddFundsVisible, toggleAddFunds } = useAddFunds();
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
      <CustomizedCardSection gap={12}>
        <Button type="default" size="large" onClick={toggleAddFunds}>
          {isAddFundsVisible ? 'Close instructions' : 'Add funds'}
        </Button>

        <Popover
          placement="topRight"
          trigger={['hover', 'click']}
          content={<Text>Ability to withdraw is coming soon</Text>}
        >
          <Button type="default" size="large" disabled>
            Withdraw
          </Button>
        </Popover>
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
      icon={<WarningOutlined />}
      message={
        <Flex vertical gap={2.5}>
          <Text className="text-base" strong style={{ color: COLOR.BROWN }}>
            Only send funds on Gnosis Chain!
          </Text>
          <Text className="text-base" style={{ color: COLOR.BROWN }}>
            You will lose any assets you send on other chains.
          </Text>
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
      <Text title={walletAddress}>GNO: {truncatedWalletAddress}</Text>
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
  <CardSection justify="center" borderTop>
    <Link target="_blank" href={COW_SWAP_GNOSIS_XDAI_OLAS_URL}>
      Get OLAS + XDAI on Gnosis Chain {UNICODE_SYMBOLS.EXTERNAL_LINK}
    </Link>
  </CardSection>
);
