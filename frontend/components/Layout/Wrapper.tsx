import { Card, Flex } from 'antd';
import { PropsWithChildren } from 'react';

export const Wrapper = ({
  children,
  vertical,
}: PropsWithChildren & { vertical?: boolean }) => {
  return (
    <Card>
      <Flex align="center" gap={10} vertical={vertical}>
        {children}
      </Flex>
    </Card>
  );
};
