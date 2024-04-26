import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, message, theme, Typography } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

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
    <Card
      title={
        <CardTitleText>
          <SettingOutlined />
          Settings
        </CardTitleText>
      }
      extra={
        <Button type="text" onClick={() => setPageState(PageState.Main)}>
          <CloseOutlined />
        </Button>
      }
    >
      <Flex gap={5} vertical>
        <Typography.Text>PASSWORD</Typography.Text>
        {isUpdating ? (
          <Input.Password></Input.Password>
        ) : (
          <Typography.Text>********</Typography.Text>
        )}
      </Flex>
      <Button
        type="text"
        disabled
        onClick={handleClick}
        style={{
          marginTop: 'auto',
          marginLeft: 'auto',
          background: token.colorFillSecondary,
        }}
      >
        {isUpdating ? 'Save' : 'Update'}
      </Button>
    </Card>
  );
};

const CardTitleText = styled(Typography.Text)`
  margin: 0;
  display: inline-flex;
  gap: 5;
  font-weight: 400;
`;
