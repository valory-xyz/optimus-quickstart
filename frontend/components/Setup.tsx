import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, message, Spin, Typography } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';

import { copyToClipboard } from '@/common-util';
import { SetupContext } from '@/context';
import { PageState, SetupScreen } from '@/enums';
import { usePageState, useSetup } from '@/hooks';

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
  return (
    <Wrapper vertical>
      <Typography.Title>Welcome</Typography.Title>
      <Button onClick={() => goto(SetupScreen.Password)}>Create Account</Button>
      <Button disabled>Import</Button>
    </Wrapper>
  );
};

const SetupPassword = () => {
  const { goto } = useSetup();
  const [password, setPassword] = useState('');
  const [isLoading] = useState(false);

  const handleClick = () => {
    goto(SetupScreen.Backup);
  };

  return (
    <Wrapper vertical>
      <Typography.Title>Password</Typography.Title>
      <Typography.Text>Enter a password</Typography.Text>
      <Input.Password
        placeholder="Input a strong password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleClick} loading={isLoading}>
        Next
      </Button>
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
      <Button onClick={() => goto(SetupScreen.Finalizing)}>Next</Button>
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
