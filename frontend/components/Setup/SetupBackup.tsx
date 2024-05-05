import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, message, Typography } from 'antd';
import { useState } from 'react';

import { copyToClipboard } from '@/common-util';
import { PageState } from '@/enums';
import { usePageState, useServices, useSetup, useWallet } from '@/hooks';

import { Wrapper } from '../Layout';

export const SetupBackup = () => {
  const { updateWalletState } = useWallet();
  const { updateServicesState } = useServices();
  const { mnemonic, setMnemonic } = useSetup();
  const { goto } = usePageState();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    setIsLoading(true);
    updateServicesState()
      .then(updateWalletState)
      .then(() => new Promise((resolve) => setTimeout(resolve, 5000)))
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
