import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, message, Spin, Typography } from 'antd';
import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Chain } from '@/client';
import { copyToClipboard } from '@/common-util';
import { SetupContext } from '@/context';
import { PageState, SetupScreen } from '@/enums';
import { usePageState, useSetup } from '@/hooks';
import { AccountService } from '@/service/Account';
import { WalletService } from '@/service/Wallet';

import { Wrapper } from './Layout/Wrapper';

/**
 * Remove RecoveryPage; add to Settings page
 *
 * 1. Setup password // post to /api/account, confirms user is created
 * 2. Backup mnemonic // post to /api/wallet, returns pubk and mnemonic
 * 3. Funding screen // initial funding polling screen,
 * 4. Finalization screen // PUT /api/wallet to setup Gnosis Safe.
 * 5. Open main window :yay:
 */

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
      case SetupScreen.Finalizing:
        return <SetupFinalizing />;
      default:
        return <>Error</>;
    }
  }, [setupObject.state]);

  return setupScreen;
};

const SetupWelcome = () => {
  const { goto } = useSetup();
  const { goto: gotoPage } = usePageState();
  const [isSetup, setIsSetup] = useState<boolean | undefined>();
  const [password, setPassword] = useState('');

  // get is setup
  useEffect(() => {
    AccountService.getAccount().then((res) => setIsSetup(res.is_setup));
  }, []);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      // login
      try {
        await AccountService.loginAccount(password).then(() =>
          gotoPage(PageState.Main),
        );
      } catch (e) {
        message.error('Login failed');
      }
      // if success, goto main
      // if fail, show error
    },
    [gotoPage, password],
  );

  const form = useMemo(() => {
    switch (isSetup) {
      // login form
      case true:
        return (
          <form onSubmit={handleLogin}>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button htmlType="submit">Login</Button>
          </form>
        );
      // create account or import
      case false:
        return (
          <>
            <Button onClick={() => goto(SetupScreen.Password)}>
              Create Account
            </Button>
            <Button disabled>Import</Button>
          </>
        );
      // loading
      default:
        return <Spin />;
    }
  }, [goto, handleLogin, isSetup, password]);

  return (
    <Wrapper vertical>
      <Typography.Title>Welcome</Typography.Title>
      {form}
    </Wrapper>
  );
};

const SetupPassword = () => {
  const { goto } = useSetup();
  const { setSetupObject } = useContext(SetupContext);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEOA = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // create account
    const createResponse = await AccountService.createAccount(password);
    setSetupObject((prev) =>
      Object.assign(prev, {
        mnemonic: createResponse.mnemonic,
      }),
    );
    goto(SetupScreen.Backup);
    setIsLoading(false);
  };

  return (
    <Wrapper vertical>
      <Typography.Title>Password</Typography.Title>
      <Typography.Text>Enter a password</Typography.Text>
      <form onSubmit={handleCreateEOA}>
        <Input.Password
          placeholder="Input a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button htmlType="submit" loading={isLoading}>
          Next
        </Button>
      </form>
    </Wrapper>
  );
};

const SetupBackup = () => {
  const { goto, mnemonic, setMnemonic } = useSetup();
  return (
    <Wrapper vertical>
      <Typography.Title>Backup</Typography.Title>
      <Typography.Text>
        Please write down the following mnemonic phrase and keep it safe.
      </Typography.Text>
      <Input.TextArea
        readOnly
        value={mnemonic.join(' ')}
        style={{ resize: 'none' }}
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
      <Button
        onClick={() => {
          goto(SetupScreen.Finalizing);
          // clear mnemonic, important
          setMnemonic([]);
        }}
      >
        Next
      </Button>
    </Wrapper>
  );
};

const SetupFinalizing = () => {
  const { goto } = usePageState();

  useEffect(() => {
    WalletService.createSafe(Chain.GNOSIS).then(() => goto(PageState.Main));
  }, [goto]);

  return (
    <Wrapper vertical>
      <Typography.Title>Finalizing</Typography.Title>
      <Spin />
      <Typography.Text>Setting up your account...</Typography.Text>
    </Wrapper>
  );
};
