import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  message,
  Spin,
  Typography,
} from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountIsSetup } from '@/client';
import { PageState, SetupScreen } from '@/enums';
import { useBalance, usePageState, useSetup } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useWallet } from '@/hooks/useWallet';
import { AccountService } from '@/service/Account';

import { FormFlex } from '../styled/FormFlex';

const { Title } = Typography;

export const SetupWelcome = () => {
  const electronApi = useElectronApi();
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
            // Reset persistent state
            // if creating new account
            electronApi.store?.clear?.();
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
    <Card bordered={false}>
      <Flex vertical align="center">
        <Image
          src={'/onboarding-robot.svg'}
          alt="Onboarding Robot"
          width={80}
          height={80}
        />
        <Title>Pearl</Title>
      </Flex>
      {welcomeScreen}
    </Card>
  );
};

export const SetupWelcomeCreate = () => {
  const { goto } = useSetup();

  return (
    <Flex vertical gap={10}>
      <Button
        color="primary"
        type="primary"
        size="large"
        onClick={() => goto(SetupScreen.SetupPassword)}
      >
        Create account
      </Button>
      <Button size="large" disabled>
        Restore access
      </Button>
    </Flex>
  );
};

export const SetupWelcomeLogin = () => {
  const { goto } = useSetup();
  const { goto: gotoPage } = usePageState();

  const { masterSafeAddress, wallets } = useWallet();
  const { isBalanceLoaded, eoaBalance } = useBalance();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [canNavigate, setCanNavigate] = useState(false);

  const [form] = Form.useForm();

  const handleLogin = useCallback(
    async ({ password }: { password: string }) => {
      setIsLoggingIn(true);
      AccountService.loginAccount(password)
        .then(() => {
          setCanNavigate(true);
        })
        .catch((e) => {
          console.error(e);
          setIsLoggingIn(false);
          message.error('Invalid password');
        });
    },
    [],
  );

  useEffect(() => {
    // Navigate only when wallets and balances are loaded
    // To check if some setup steps were missed
    if (canNavigate && wallets?.length && isBalanceLoaded) {
      setIsLoggingIn(false);
      if (!eoaBalance?.ETH) {
        goto(SetupScreen.SetupEoaFundingIncomplete);
      } else if (!masterSafeAddress) {
        goto(SetupScreen.SetupCreateSafe);
      } else {
        gotoPage(PageState.Main);
      }
    }
  }, [
    canNavigate,
    eoaBalance?.ETH,
    goto,
    gotoPage,
    isBalanceLoaded,
    masterSafeAddress,
    wallets?.length,
  ]);

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
          target="_blank"
          size="small"
          onClick={() => goto(SetupScreen.Restore)}
        >
          Forgot password? Restore access
        </Button>
      </Flex>
    </FormFlex>
  );
};
