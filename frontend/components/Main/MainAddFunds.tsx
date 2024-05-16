import {
  CopyOutlined,
  // QrcodeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Flex,
  message,
  Popover,
  // QRCode,
  Tooltip,
  Typography,
} from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { copyToClipboard, truncateAddress } from '@/common-util';
import { COLOR, COW_SWAP_GNOSIS_XDAI_OLAS_URL } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useWallet } from '@/hooks/useWallet';
import { Address } from '@/types';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

const CustomizedCardSection = styled(CardSection)<{ border?: boolean }>`
  > .ant-btn {
    width: 50%;
  }
`;

export const MainAddFunds = () => {
  const { masterSafeAddress, masterEoaAddress } = useWallet();
  const [isAddFundsVisible, setIsAddFundsVisible] = useState(false);

  const fundingAddress: Address | undefined =
    masterSafeAddress ?? masterEoaAddress;

  const truncatedFundingAddress: string | undefined = useMemo(
    () => fundingAddress && truncateAddress(fundingAddress),
    [fundingAddress],
  );

  const handleCopyAddress = useCallback(
    () =>
      fundingAddress &&
      copyToClipboard(fundingAddress).then(() =>
        message.success('Copied successfully!'),
      ),
    [fundingAddress],
  );

  return (
    <>
      <CustomizedCardSection gap={12}>
        <Button
          type="default"
          size="large"
          onClick={() => setIsAddFundsVisible((prev) => !prev)}
        >
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
            truncatedFundingAddress={truncatedFundingAddress}
            fundingAddress={masterSafeAddress}
            handleCopy={handleCopyAddress}
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
  fundingAddress,
  truncatedFundingAddress,
  handleCopy,
}: {
  fundingAddress?: string;
  truncatedFundingAddress?: string;
  handleCopy: () => void;
}) => (
  <CardSection gap={10} justify="center" align="center">
    <Tooltip
      title={
        <span className="can-select-text flex">
          {fundingAddress ?? 'Error loading address'}
        </span>
      }
    >
      <Text title={fundingAddress}>GNO: {truncatedFundingAddress ?? '--'}</Text>
    </Tooltip>

    <Button onClick={handleCopy}>
      <CopyOutlined />
    </Button>

    {/* <Popover
      title="Scan QR code"
      content={
        <QRCode
          size={250}
          value={`https://metamask.app.link/send/${fundingAddress}@${100}`}
        />
      }
    >
      <Button>
        <QrcodeOutlined />
      </Button>
    </Popover> */}
  </CardSection>
);

const AddFundsGetTokensSection = () => (
  <CardSection justify="center" borderTop>
    <Link target="_blank" href={COW_SWAP_GNOSIS_XDAI_OLAS_URL}>
      Get OLAS + XDAI on Gnosis Chain {UNICODE_SYMBOLS.EXTERNAL_LINK}
    </Link>
  </CardSection>
);
