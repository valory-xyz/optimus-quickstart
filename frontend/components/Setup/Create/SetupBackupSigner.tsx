import { Button, Form, Input, Typography } from 'antd';
import { isAddress } from 'ethers/lib/utils';

import { CardFlex } from '@/components/styled/CardFlex';
import { SetupScreen } from '@/enums';
import { useSetup } from '@/hooks';

import { SetupCreateHeader } from './SetupCreateHeader';

export const SetupBackupSigner = () => {
  const { backupSigner, setBackupSigner, goto } = useSetup();
  const [form] = Form.useForm();

  const handleNext = () => {};

  return (
    <CardFlex>
      <SetupCreateHeader prev={SetupScreen.SetupSeedPhrase} />
      <Typography.Title level={3}>Set backup wallet</Typography.Title>
      <Typography.Text>
        To keep your funds safe, we encourage you to add one of your existing
        crypto wallets as a backup. This enables you to recover your funds if
        you lose both your password and seed phrase.
      </Typography.Text>
      <Form form={form}>
        <Form.Item
          label="Backup wallet address"
          rules={[
            {
              required: true,
              message: 'Please input your backup wallet address!',
            },
            {
              min: 42,
              message: 'Please input a valid wallet address',
              type: 'string',
              validator(rule, value, callback) {
                if (!isAddress(value)) {
                  callback('Please input a valid wallet address');
                  return;
                }
                callback();
              },
            },
          ]}
        >
          <Input name="backup-signer" placeholder={'e.g. 0x12345...54321'} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" size="large" htmlType="submit" />
        </Form.Item>
        <Button type="link" size="large">
          Skip for now
        </Button>
        <Typography.Text>
          <small>
            Note that in the current version of the app, you will not be able to
            set up a backup wallet afterward. This functionality is coming soon.
          </small>
        </Typography.Text>
      </Form>
    </CardFlex>
  );
};
