import { useContext, useEffect, useMemo, useState } from 'react';
import { Wrapper } from './Layout/Wrapper';
import { Button, Input, Spin, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { SetupScreen } from '@/enums/SetupScreen';
import { SetupContext } from '@/context/SetupProvider';
import { useSetup } from '@/hooks/useSetup';
import { usePageState } from '@/hooks/usePageState';
import { PageState } from '@/context/PageStateProvider';
import { copyToClipboard } from '@/common-util/copyToClipboard';
import crypto from 'crypto';

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
      case SetupScreen.Backup:
        return <SetupBackup />;
      case SetupScreen.Import:
        return <SetupImport />;
      case SetupScreen.Password:
        return <SetupPassword />;
      case SetupScreen.Recovery:
        return <SetupRecovery />;
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
  return (
    <Wrapper vertical>
      <Typography.Title>Welcome</Typography.Title>
      <Button onClick={() => goto(SetupScreen.Backup)}>Create Wallet</Button>
      <Button disabled>Import Wallet</Button>
    </Wrapper>
  );
};

const SetupBackup = () => {
  const { goto } = useSetup();
  const [mnemonic] = useState(
    'test test test test test test test test test test test test',
  );
  return (
    <Wrapper vertical>
      <Typography.Title>Backup</Typography.Title>
      <Typography.Text>
        Please write down the following mnemonic phrase and keep it safe.
      </Typography.Text>
      <Input.TextArea readOnly value={mnemonic} style={{ resize: 'none' }} />
      <Button
        onClick={() =>
          copyToClipboard(mnemonic).then(() =>
            message.success('Copied successfully!'),
          )
        }
      >
        <CopyOutlined /> Copy to clipboard
      </Button>
      <Button onClick={() => goto(SetupScreen.Password)}>Next</Button>
    </Wrapper>
  );
};

const SetupImport = () => {
  const { goto } = useSetup();
  return (
    <Wrapper vertical>
      <Typography.Title>Import</Typography.Title>
      <Typography.Text>
        Enter your mnemonic phrase to import your account
      </Typography.Text>
      <Input.TextArea />
      <Button onClick={() => goto(SetupScreen.Password)}>Next</Button>
    </Wrapper>
  );
};

const SetupPassword = () => {
  const { goto, setPasswordHash } = useSetup();
  const [password, setPassword] = useState('');

  const passwordHash = useMemo(
    () => crypto.createHash('sha256').update(password).digest('hex'),
    [password],
  );

  return (
    <Wrapper vertical>
      <Typography.Title>Password</Typography.Title>
      <Typography.Text>Enter a password</Typography.Text>
      <Input.Password
        placeholder="Input a strong password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        onClick={() => {
          setPasswordHash(passwordHash);
          goto(SetupScreen.Recovery);
        }}
      >
        Next
      </Button>
    </Wrapper>
  );
};

const SetupRecovery = () => {
  const { goto } = useSetup();
  return (
    <Wrapper vertical>
      <Typography.Title>Recovery</Typography.Title>
      <Typography.Text>
        Please enter a public key that you can use to recover your wallet.
      </Typography.Text>
      <Input.TextArea />
      <Button onClick={() => goto(SetupScreen.Finalizing)}>Recover</Button>
    </Wrapper>
  );
};

const SetupFinalizing = () => {
  const { goto } = usePageState();

  //   Mock some async setup operation
  const handleTimeout = () => {
    setTimeout(() => {
      goto(PageState.Main);
    }, 3000);
  };

  useEffect(() => {
    handleTimeout();
    // Run once only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper vertical>
      <Typography.Title>Finalizing</Typography.Title>
      <Spin />
      <Typography.Text>Setting up your wallet...</Typography.Text>
    </Wrapper>
  );
};
