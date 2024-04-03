import { CopyOutlined } from '@ant-design/icons';
import { Button, Flex, Input, message, QRCode, Spin, Typography } from 'antd';
import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { Chain } from '@/client';
import { copyToClipboard } from '@/common-util';
import { SetupContext } from '@/context';
import { PageState, SetupScreen } from '@/enums';
import { usePageState, useSetup, useWallet } from '@/hooks';
import { EthersService } from '@/service';
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
      case SetupScreen.Funding:
        return <SetupFunding />;
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
  const { updateWallets, updateBalance } = useWallet();

  // get is setup
  useEffect(() => {
    AccountService.getAccount().then((res) => setIsSetup(res.is_setup));
  }, []);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      // login
      AccountService.loginAccount(password)
        .then(() => updateWallets())
        .then(() => updateBalance())
        .then(() => gotoPage(PageState.Main))
        .catch(() => message.error('Invalid password'));
    },
    [gotoPage, password, updateBalance, updateWallets],
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
  const { goto, setMnemonic } = useSetup();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEOA = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // create account
    AccountService.createAccount(password)
      .then(() => AccountService.loginAccount(password))
      .then(() => WalletService.createEOA(Chain.GNOSIS))
      .then(({ mnemonic }) => {
        setMnemonic(mnemonic);
        goto(SetupScreen.Backup);
      })
      .finally(() => setIsLoading(false));
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
  const { updateWallets } = useWallet();
  const { goto, mnemonic, setMnemonic } = useSetup();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    setIsLoading(true);
    updateWallets()
      .then(() => setMnemonic([]))
      .then(() => goto(SetupScreen.Funding))
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

const SetupFunding = () => {
  const {
    wallets: [{ address }],
  } = useWallet();
  const { goto } = useSetup();

  useInterval(() => {
    EthersService.getEthBalance(address, 'http://localhost:8545').then(
      (balance) => {
        if (balance > 0) {
          goto(SetupScreen.Finalizing);
        }
      },
    );
  }, 3000);

  return (
    <Wrapper vertical>
      <Typography.Title>Funding</Typography.Title>
      <Typography.Text>
        You&apos;ll need to fund your wallet with at least 1 XDAI.
      </Typography.Text>
      <QRCode value={`https://metamask.app.link/send/${address}@${100}`} />
      <Flex gap={10}>
        <Typography.Text className="can-select-text" code title={address}>
          {`${address?.substring(0, 6)}...${address?.substring(address.length - 4, address.length)}`}
        </Typography.Text>
        <Button>
          <CopyOutlined
            onClick={() => navigator.clipboard.writeText(address)}
          />
        </Button>
      </Flex>
    </Wrapper>
  );
};

const SetupFinalizing = () => {
  const { goto } = usePageState();
  const { updateWallets, updateBalance } = useWallet();

  useEffect(() => {
    WalletService.createSafe(Chain.GNOSIS)
      .then(() => updateWallets())
      .then(() => updateBalance())
      .then(() => goto(PageState.Main));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper vertical>
      <Typography.Title>Finalizing</Typography.Title>
      <Spin />
      <Typography.Text>Setting up your account...</Typography.Text>
    </Wrapper>
  );
};
