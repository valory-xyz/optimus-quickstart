import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Flex, Input, message, theme, Typography } from 'antd';
import { useState } from 'react';

import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

import { Header } from './Layout/Header';
import { Wrapper } from './Layout/Wrapper';

const { useToken } = theme;

export const Settings = () => {
  const { setPageState } = usePageState();
  const { token } = useToken();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = () => {
    if (isUpdating) handleSave();
    setIsUpdating((prev) => !prev);
  };

  const handleSave = () => {
    message.success('Password updated!');
  };

  return (
    <>
      <Header>
        <Typography.Text
          style={{ margin: 0, display: 'inline-flex', gap: 5, fontWeight: 400 }}
        >
          <SettingOutlined />
          Settings
        </Typography.Text>
        <Button
          type="text"
          style={{ marginLeft: 'auto' }}
          onClick={() => setPageState(PageState.Main)}
        >
          <CloseOutlined />
        </Button>
      </Header>
      <Wrapper>
        <Flex gap={5} vertical>
          <Typography.Text style={{ fontSize: 16 }}>PASSWORD</Typography.Text>
          {isUpdating ? (
            <Input></Input>
          ) : (
            <Typography.Text>********</Typography.Text>
          )}
        </Flex>
        <Button
          type="text"
          onClick={handleClick}
          style={{
            marginTop: 'auto',
            marginLeft: 'auto',
            background: token.colorFillSecondary,
          }}
        >
          {isUpdating ? 'Save' : 'Update'}
        </Button>
      </Wrapper>
    </>
  );
};
