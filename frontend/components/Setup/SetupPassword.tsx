import { Button, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';

import { Chain } from '@/client';
import { SetupScreen } from '@/enums';
import { useSetup } from '@/hooks';
import { AccountService } from '@/service/Account';
import { WalletService } from '@/service/Wallet';

import { Wrapper } from '../Layout';

export const SetupPassword = () => {
  const { goto, setMnemonic } = useSetup();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEoa = async ({ password }: { password: string }) => {
    setIsLoading(true);
    AccountService.createAccount(password)
      .then(() => AccountService.loginAccount(password))
      .then(() => WalletService.createEoa(Chain.GNOSIS))
      .then(({ mnemonic }: { mnemonic: string[] }) => {
        setMnemonic(mnemonic);
        goto(SetupScreen.Backup);
      })
      .catch((e) => {
        console.error(e);
        message.error('Error creating account');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Wrapper vertical>
      <Typography.Title>Password</Typography.Title>
      <Typography.Text>Enter a password</Typography.Text>
      <Form form={form} onFinish={handleCreateEoa}>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input a Password!' }]}
        >
          <Input.Password size="large" placeholder="Password" />
        </Form.Item>
        <Button size="large" htmlType="submit" loading={isLoading}>
          Next
        </Button>
      </Form>
    </Wrapper>
  );
};
