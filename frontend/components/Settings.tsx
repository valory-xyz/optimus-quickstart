import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Input, message, Typography } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { PageState } from '@/enums';
import { usePageState } from '@/hooks';

export const Settings = () => {
  const { setPageState } = usePageState();

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
      <Flex justify="space-between" align="center">
        <Flex gap={5} vertical>
          <Typography.Text>Password</Typography.Text>
          {isUpdating ? (
            <Input.Password></Input.Password>
          ) : (
            <Typography.Text>********</Typography.Text>
          )}
        </Flex>
        <Button disabled onClick={handleClick}>
          {isUpdating ? 'Save' : 'Update'}
        </Button>
      </Flex>
    </Card>
  );
};

const CardTitleText = styled(Typography.Text)`
  margin: 0;
  display: inline-flex;
  gap: 5px;
  font-weight: 400;
`;
