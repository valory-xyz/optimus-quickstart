import {
  CopyOutlined,
  // QrcodeOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Flex,
  message,
  // Popover,
  // QRCode,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Chain } from '@/client';
import { copyToClipboard } from '@/common-util';
import { CardFlex } from '@/components/styled/CardFlex';
import { CardSection } from '@/components/styled/CardSection';
import { COLOR, COW_SWAP_GNOSIS_XDAI_OLAS_URL } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { PageState, SetupScreen } from '@/enums';
import { useBalance, usePageState, useSetup } from '@/hooks';
import { WalletService } from '@/service/Wallet';
import { Address } from '@/types';

import { SetupCreateHeader } from './SetupCreateHeader';

const MASTER_EAO_FUNDING_AMOUNT_ETH = 0.1;

enum SetupEaoFundingStatus {
  WaitingForEoaFunding,
  CreatingSafe,
  Done,
  Error,
}

const loadingStatuses = [
  SetupEaoFundingStatus.WaitingForEoaFunding,
  SetupEaoFundingStatus.CreatingSafe,
];

export const SetupEoaFunding = () => {
  const { wallets, walletBalances } = useBalance();
  const { backupSigner } = useSetup();
  const { goto } = usePageState();

  const [isCreatingSafe, setIsCreatingSafe] = useState(false);

  const masterEoa = wallets?.[0]?.address;
  const masterEaoEthBalance = walletBalances?.[masterEoa]?.ETH;

  const masterSafe = wallets?.[0]?.safe;

  const isFundedMasterEoa =
    masterEaoEthBalance && masterEaoEthBalance >= MASTER_EAO_FUNDING_AMOUNT_ETH;

  const status = useMemo(() => {
    if (!isFundedMasterEoa) return SetupEaoFundingStatus.WaitingForEoaFunding;
    if (isCreatingSafe) return SetupEaoFundingStatus.CreatingSafe;
    if (masterSafe) return SetupEaoFundingStatus.Done;
    return SetupEaoFundingStatus.Error;
  }, [isCreatingSafe, isFundedMasterEoa, masterSafe]);

  const statusMessage = useMemo(() => {
    switch (status) {
      case SetupEaoFundingStatus.WaitingForEoaFunding:
        return 'Waiting for transaction';
      case SetupEaoFundingStatus.CreatingSafe:
        return 'Creating account';
      case SetupEaoFundingStatus.Done:
        return 'Account created';
      case SetupEaoFundingStatus.Error:
        return 'Error, please contact support';
    }
  }, [status]);

  useEffect(() => {
    // Create the safe once the master EOA is funded
    if (!isFundedMasterEoa) return;
    if (isCreatingSafe) return;
    setIsCreatingSafe(true);
    message.success('Funds have been received!');
    // TODO: add backup signer
    WalletService.createSafe(Chain.GNOSIS).catch((e) => {
      console.error(e);
      message.error('Failed to create an account. Please try again later.');
    });
  }, [backupSigner, goto, isCreatingSafe, isFundedMasterEoa]);

  useEffect(() => {
    // Only progress is the safe is created and accessible via context (updates on interval)
    if (masterSafe) goto(PageState.Main);
  }, [goto, masterSafe]);

  return (
    <CardFlex>
      <SetupCreateHeader
        prev={SetupScreen.SetupBackupSigner}
        disabled={isCreatingSafe}
      />
      <Typography.Title level={3}>
        Deposit {MASTER_EAO_FUNDING_AMOUNT_ETH} XDAI
      </Typography.Title>
      <Typography.Paragraph>
        The app needs these funds to create your account on-chain.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Note that this address will not be used after account creation.
      </Typography.Paragraph>

      <CardSection borderTop borderBottom>
        <Typography.Text
          className={loadingStatuses.includes(status) ? 'loading-ellipses' : ''}
        >
          Status: {statusMessage}
        </Typography.Text>
      </CardSection>
      {!isFundedMasterEoa && <SetupEoaFundingWaiting masterEoa={masterEoa} />}
    </CardFlex>
  );
};

const SetupEoaFundingWaiting = ({
  masterEoa,
}: {
  masterEoa: Address | undefined;
}) => {
  return (
    <>
      <CardSection>
        <Alert
          className="card-section-alert"
          type="warning"
          showIcon
          message={
            <Flex vertical gap={5}>
              <Typography.Text strong style={{ color: COLOR.BROWN }}>
                Only send funds on Gnosis Chain!
              </Typography.Text>
              <Typography.Text style={{ color: COLOR.BROWN }}>
                You will lose any assets you send on other chains.
              </Typography.Text>
            </Flex>
          }
        />
      </CardSection>
      <CardSection borderTop borderBottom vertical gap={10}>
        <AccountCreationCardFlex gap={10}>
          <Flex justify="space-between">
            <Typography.Text className="text-sm" strong>
              Account creation address
            </Typography.Text>
            <Flex gap={10} align="center">
              <Tooltip title="Copy to clipboard">
                <CopyOutlined
                  onClick={() =>
                    masterEoa &&
                    copyToClipboard(masterEoa).then(() =>
                      message.success('Address copied!'),
                    )
                  }
                />
              </Tooltip>

              {/* {masterEoa && (
                <Popover
                  title="Scan QR code"
                  content={
                    <QRCode
                      size={250}
                      value={`https://metamask.app.link/send/${masterEoa}@${100}`}
                    />
                  }
                >
                  <QrcodeOutlined />
                </Popover>
              )} */}
            </Flex>
          </Flex>

          <span className="can-select-text break-word">
            GNO:&nbsp;{masterEoa}
          </span>
        </AccountCreationCardFlex>
        <Button
          type="link"
          target="_blank"
          href={COW_SWAP_GNOSIS_XDAI_OLAS_URL}
        >
          Get XDAI on Gnosis Chain{UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Button>
      </CardSection>
    </>
  );
};

const AccountCreationCardFlex = styled(CardFlex)`
  .ant-card-body {
    background-color: ${COLOR.ACCOUNT_CREATION_CARD_GRAY};
  }
`;
