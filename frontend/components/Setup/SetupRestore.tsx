import { CloseOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import { memo } from 'react';

import { CardFlex } from '@/components/styled/CardFlex';
import { CardSection } from '@/components/styled/CardSection';
import { SetupScreen } from '@/enums';
import { useSetup } from '@/hooks';

const ExitButton = memo(function ExitButton() {
  const { goto } = useSetup();
  return (
    <Button size="large" onClick={() => goto(SetupScreen.Welcome)}>
      <CloseOutlined />
    </Button>
  );
});

export const SetupRestoreMain = () => {
  const { goto } = useSetup();
  return (
    <CardFlex
      title={
        <Flex justify="space-between">
          <Typography.Title level={3}>Restore access</Typography.Title>
          <ExitButton />
        </Flex>
      }
      gap={10}
    >
      <CardSection vertical border>
        <Typography.Text>
          You can recover the Operate account access by providing the seed
          phrase you received when setting up your account.
        </Typography.Text>
        <Button
          size="large"
          type="primary"
          className="w-3/4"
          onClick={() => goto(SetupScreen.RestoreViaSeed)}
        >
          Restore account via seed phrase
        </Button>
      </CardSection>
      <CardSection vertical border>
        <Typography.Text>
          If you don’t have the seed phrase but added a backup wallet to your
          account, you can still restore your funds, but you won’t be able to
          recover access to your Operate account.
        </Typography.Text>
        <Button
          size="large"
          type="primary"
          className="w-3/4"
          onClick={() => goto(SetupScreen.RestoreViaBackup)}
        >
          Restore funds via backup wallet
        </Button>
      </CardSection>
    </CardFlex>
  );
};

export const SetupRestoreViaSeed = () => {
  return (
    <CardFlex
      title={
        <Flex justify="space-between">
          <Typography.Title level={3}>Restore via seed phrase</Typography.Title>
          <ExitButton />
        </Flex>
      }
      gap={10}
    ></CardFlex>
  );
};

export const SetupRestoreSetPassword = () => {
  return (
    <CardFlex
      title={
        <Flex justify="space-between">
          <Typography.Title level={3}>Set password</Typography.Title>
          <ExitButton />
        </Flex>
      }
      gap={10}
    ></CardFlex>
  );
};

export const SetupRestoreViaBackup = () => {
  return (
    <CardFlex
      title={
        <Flex justify="space-between">
          <Typography.Title level={3}>Set password</Typography.Title>
          <ExitButton />
        </Flex>
      }
      gap={10}
    ></CardFlex>
  );
};
