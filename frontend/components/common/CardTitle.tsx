import { Flex, Typography } from 'antd';
import { ReactNode } from 'react';

export const CardTitle = ({ title }: { title: string | ReactNode }) => (
  <Flex justify="space-between" align="center">
    <Typography.Title className="m-0" level={4}>
      {title}
    </Typography.Title>
  </Flex>
);
