import { Button, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';

import { Chain } from '@/client';
import { SetupScreen } from '@/enums';
import { useSetup } from '@/hooks';
import { AccountService } from '@/service/Account';
import { WalletService } from '@/service/Wallet';

import { CardFlex } from '../../styled/CardFlex';
import { SetupCreateHeader } from './SetupCreateHeader';

const { Title, Text } = Typography;

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
        goto(SetupScreen.SetupSeedPhrase);
      })
      .catch((e) => {
        console.error(e);
        message.error('Error creating account');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <CardFlex gap={10}>
      <SetupCreateHeader prev={SetupScreen.Welcome} />
      <Title level={3}>Create password</Title>
      <Text>Come up with a strong password.</Text>
      <Form form={form} onFinish={handleCreateEoa}>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input a Password!' }]}
        >
          <Input.Password size="large" placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isLoading}
          >
            Continue
          </Button>
        </Form.Item>
      </Form>
    </CardFlex>
  );
};
