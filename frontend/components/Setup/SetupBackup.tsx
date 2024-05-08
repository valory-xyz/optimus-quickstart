import { CopyOutlined } from '@ant-design/icons';
import { Button, Flex, message, Tag, Typography } from 'antd';
import { useState } from 'react';

import { copyToClipboard } from '@/common-util';
import { PageState } from '@/enums';
import { usePageState, useSetup } from '@/hooks';

import { Wrapper } from '../Layout';

export const SetupBackup = () => {
  const { mnemonic, setMnemonic } = useSetup();
  const { goto } = usePageState();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    setIsLoading(true);
    setMnemonic([]);
    goto(PageState.Main);
    setIsLoading(false);
  };

  return (
    <Wrapper vertical>
      <Typography.Title level={3}>Back up seed phrase</Typography.Title>
      <Typography.Text>
        Seed phrase is needed to regain access to your account if you forgot the
        password.
      </Typography.Text>
      <Flex gap={10} wrap="wrap">
        {mnemonic.map((word) => (
          <Tag key={word}>{word}</Tag>
        ))}
      </Flex>
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
