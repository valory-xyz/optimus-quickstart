import { CopyOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Spin, Typography } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountIsSetup, Chain } from '@/client';
import { copyToClipboard } from '@/common-util';
import { SetupContext } from '@/context';
import { PageState, SetupScreen } from '@/enums';
import { usePageState, useSetup, useWallet } from '@/hooks';
import { AccountService } from '@/service/Account';
import { WalletService } from '@/service/Wallet';

import { Wrapper } from './Layout/Wrapper';

export const Setup = () => {
  const { setupObject } = useContext(SetupContext);
  const setupScreen = useMemo(() => {
    switch (setupObject.state) {
      case SetupScreen.Welcome:
        return <SetupWelcome />;
      case SetupScreen.Password:
        return <SetupPassword />;
      case SetupScreen.Backup:
        return <SetupBackup />;
      default:
        return <>Error</>;
    }
  }, [setupObject.state]);

  return setupScreen;
};

const SetupWelcome = () => {
  const { goto } = useSetup();
  const { goto: gotoPage } = usePageState();
  const [isSetup, setIsSetup] = useState<AccountIsSetup>(
    AccountIsSetup.Loading,
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [form] = Form.useForm();

  const { update } = useWallet();

  // get is setup
  useEffect(() => {
    AccountService.getAccount()
      .then((res) => {
        switch (res.is_setup) {
          case true:
            setIsSetup(AccountIsSetup.True);
            break;
          case false:
            setIsSetup(AccountIsSetup.False);
            break;
          default:
            setIsSetup(AccountIsSetup.Error);
            break;
        }
      })
      .catch((e) => {
        console.error(e);
        setIsSetup(AccountIsSetup.Error);
      });
  }, []);

  const handleLogin = useCallback(
    async ({ password }: { password: string }) => {
      setIsLoggingIn(true);
      try {
        await AccountService.loginAccount(password);
        await update();
        gotoPage(PageState.Main);
      } catch (e) {
        console.error(e);
        message.error('Invalid password');
      }
      setIsLoggingIn(false);
    },
    [gotoPage, update],
  );

  const welcomeScreen = useMemo(() => {
    switch (isSetup) {
      case AccountIsSetup.True:
        return (
          <Form form={form} onFinish={handleLogin}>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your Password!' },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Button htmlType="submit" loading={isLoggingIn}>
              Login
            </Button>
          </Form>
        );
      case AccountIsSetup.False:
        return (
          <>
            <Button onClick={() => goto(SetupScreen.Password)}>
              Create Account
            </Button>
            <Button disabled>Import</Button>
          </>
        );
      case AccountIsSetup.Error:
        return (
          <>
            <Typography.Text type="danger">
              Error loading account status, please reload the application.
            </Typography.Text>
          </>
        );
      default:
        return <Spin />;
    }
  }, [form, goto, handleLogin, isLoggingIn, isSetup]);

  return (
    <Wrapper vertical>
      <Typography.Title>Welcome</Typography.Title>
      {welcomeScreen}
    </Wrapper>
  );
};

const SetupPassword = () => {
  const { goto, setMnemonic } = useSetup();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEoa = async ({ password }: { password: string }) => {
    setIsLoading(true);
    AccountService.createAccount(password)
      .then(() => AccountService.loginAccount(password))
      .then(() => WalletService.createEoa(Chain.GNOSIS))
      .then(({ mnemonic }: { mnemonic: string[] }) => {
        setMnemonic(mnemonic);
        goto(SetupScreen.Backup);
      })
      .catch((e) => {
        console.error(e);
        message.error('Error creating account');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Wrapper vertical>
      <Typography.Title>Password</Typography.Title>
      <Typography.Text>Enter a password</Typography.Text>
      <Form form={form} onFinish={handleCreateEoa}>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input a Password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Button htmlType="submit" loading={isLoading}>
          Next
        </Button>
      </Form>
    </Wrapper>
  );
};

const SetupBackup = () => {
  const { update } = useWallet();
  const { mnemonic, setMnemonic } = useSetup();
  const { goto } = usePageState();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    setIsLoading(true);
    update()
      .then(() => setMnemonic([]))
      .then(() => goto(PageState.Main))
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  };

  return (
    <Wrapper vertical>
      <Typography.Title>Backup</Typography.Title>
      <Typography.Text>
        Write down your mnemonic phrase and keep it safe.
      </Typography.Text>
      <Input.TextArea
        readOnly
        value={mnemonic.join(' ')}
        style={{ resize: 'none' }}
        autoSize={{ minRows: 3, maxRows: 6 }}
        disabled
      />
      <Button
        onClick={() =>
          copyToClipboard(mnemonic.join(' ')).then(() =>
            message.success('Copied successfully!'),
          )
        }
      >
        <CopyOutlined /> Copy to clipboard
      </Button>
      <Button onClick={handleNext} loading={isLoading}>
        Next
      </Button>
    </Wrapper>
  );
};
