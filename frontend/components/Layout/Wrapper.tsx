import { Card, Flex } from 'antd';
import { PropsWithChildren } from 'react';

export const Wrapper = ({
  children,
  vertical,
}: PropsWithChildren & { vertical?: boolean }) => {
  return (
    <Card>
      <Flex style={{ alignItems: 'center', gap: 10 }} vertical={vertical}>
        {children}
      </Flex>
    </Card>
  );
};
