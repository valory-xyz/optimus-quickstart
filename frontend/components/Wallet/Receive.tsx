import {
  ArrowDownOutlined,
  CloseOutlined,
  CopyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Flex, QRCode, Typography, message } from 'antd';
import { Header } from '../Layout/Header';
import { Wrapper } from '../Layout/Wrapper';
import { usePageState } from '@/hooks/usePageState';
import { PageState } from '@/context/PageStateProvider';
import { useAppInfo } from '@/hooks';
import { copyToClipboard } from '@/common-util/copyToClipboard';

export const Receive = () => {
  const { setPageState } = usePageState();
  const { userPublicKey } = useAppInfo();
  const handleCopy = () =>
    copyToClipboard(`${userPublicKey}`).then(() => message.success('Copied!'));

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
          <QRCode value={`${userPublicKey}`} />
          <Flex gap={10}>
            <Typography.Text>{userPublicKey}</Typography.Text>
            <Button>
              <CopyOutlined onClick={handleCopy} />
            </Button>
          </Flex>
        </Flex>
      </Wrapper>
    </>
  );
};
