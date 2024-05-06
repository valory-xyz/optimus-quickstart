import { Button, Flex, Form, Input, message, Spin, Typography } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountIsSetup } from '@/client';
import { PageState, SetupScreen } from '@/enums';
import { usePageState, useServices, useSetup } from '@/hooks';
import { AccountService } from '@/service/Account';

import { Wrapper } from '../Layout';
import { FormFlex } from '../styled/FormFlex';

export const SetupWelcome = () => {
  const [isSetup, setIsSetup] = useState<AccountIsSetup>(
    AccountIsSetup.Loading,
  );

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

  const welcomeScreen = useMemo(() => {
    switch (isSetup) {
      case AccountIsSetup.True:
        return <SetupWelcomeLogin />;
      case AccountIsSetup.False:
        return <SetupWelcomeCreate />;
      default:
        return <Spin />;
    }
  }, [isSetup]);

  return (
    <Wrapper vertical>
      <Flex vertical align="center">
        <Image
          src={'/onboarding-robot.svg'}
          alt="Onboarding Robot"
          width={80}
          height={80}
        />
        <Typography.Title>Operate</Typography.Title>
      </Flex>
      {welcomeScreen}
    </Wrapper>
  );
};

export const SetupWelcomeCreate = () => {
  const { goto } = useSetup();

  return (
    <>
      <Button color="primary" onClick={() => goto(SetupScreen.Password)}>
        Create Account
      </Button>
      <Button disabled>Import</Button>
    </>
  );
};

export const SetupWelcomeLogin = () => {
  const { goto: gotoPage } = usePageState();
  const { updateServicesState } = useServices();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [form] = Form.useForm();

  const handleLogin = useCallback(
    async ({ password }: { password: string }) => {
      setIsLoggingIn(true);
      AccountService.loginAccount(password)
        .then(() => updateServicesState())
        .then(() => gotoPage(PageState.Main))
        .catch((e) => {
          console.error(e);
          message.error('Invalid password');
        })
        .finally(() => setIsLoggingIn(false));
    },
    [gotoPage, updateServicesState],
  );

  return (
    <FormFlex form={form} onFinish={handleLogin}>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your Password!' }]}
      >
        <Input.Password size="large" placeholder="Password" />
      </Form.Item>
      <Flex vertical gap={10}>
        <Button
          htmlType="submit"
          type="primary"
          size="large"
          loading={isLoggingIn}
        >
          Login
        </Button>
        <Button
          type="link"
          href={'https://discord.gg/RHY6eJ35ar'}
          target="_blank"
          size="small"
        >
          Forgot password? Seek community help
        </Button>
      </Flex>
    </FormFlex>
  );
};
