import { CopyOutlined } from '@ant-design/icons';
import { Button, Flex, message, Tag, Typography } from 'antd';
import { useState } from 'react';

import { copyToClipboard } from '@/common-util';
import { PageState, SetupScreen } from '@/enums';
import { usePageState, useSetup } from '@/hooks';

import { CardFlex } from '../../styled/CardFlex';
import { SetupCreateHeader } from './SetupCreateHeader';

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
    <CardFlex gap={10}>
      <SetupCreateHeader prev={SetupScreen.SetupPassword} />
      <Typography.Title level={3}>Back up seed phrase</Typography.Title>
      <Typography.Text>
        Seed phrase is needed to regain access to your account if you forget the
        password.
      </Typography.Text>
      <Flex gap={10} wrap="wrap">
        {mnemonic.map((word) => (
          <Tag key={word}>{word}</Tag>
        ))}
      </Flex>
      <Button
        size="large"
        onClick={() =>
          copyToClipboard(mnemonic.join(' ')).then(() =>
            message.success('Seed phrase is copied!'),
          )
        }
      >
        <CopyOutlined /> Copy to clipboard
      </Button>
      <Button
        type="primary"
        size="large"
        onClick={handleNext}
        loading={isLoading}
      >
        Confirm and create account
      </Button>
    </CardFlex>
  );
};
