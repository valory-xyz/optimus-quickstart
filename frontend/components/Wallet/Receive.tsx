import {
  ArrowDownOutlined,
  CloseOutlined,
  CopyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Flex, message, QRCode, Typography } from 'antd';

import { copyToClipboard } from '@/common-util';
import { PageState } from '@/enums';
import { usePageState, useWallet } from '@/hooks';

import { Header } from '../Layout/Header';
import { Wrapper } from '../Layout/Wrapper';

export const Receive = () => {
  const { setPageState } = usePageState();
  const { wallets } = useWallet();
  const handleCopy = () =>
    copyToClipboard(wallets[0].address).then(() => message.success('Copied!'));

  return (
    <>
      <Header>
        <ArrowDownOutlined />
        <Typography style={{ margin: 0 }}>Receive</Typography>
        <Button
          type="text"
          style={{ marginLeft: 'auto' }}
          onClick={() => setPageState(PageState.Main)}
        >
          <CloseOutlined />
        </Button>
      </Header>
      <Wrapper>
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
            value={`https://metamask.app.link/send/${wallets[0].address}@${100}`}
          />
          <Flex gap={10}>
            <Typography.Text
              className="can-select-text"
              code
              title={wallets[0].address}
            >
              {`${wallets[0].address?.substring(0, 6)}...${wallets[0].address?.substring(wallets[0].address.length - 4, wallets[0].address.length)}`}
            </Typography.Text>
            <Button>
              <CopyOutlined onClick={handleCopy} />
            </Button>
          </Flex>
        </Flex>
      </Wrapper>
    </>
  );
};
