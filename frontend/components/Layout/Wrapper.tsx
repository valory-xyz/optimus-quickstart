import { Card, Flex } from 'antd';
import { PropsWithChildren } from 'react';

const wrapperStyles = { alignItems: 'center', gap: 10 };

export const Wrapper = ({
  children,
  vertical,
}: PropsWithChildren & { vertical?: boolean }) => {
  return (
    <Card>
      <Flex style={wrapperStyles} vertical={vertical}>
        {children}
      </Flex>
    </Card>
  );
};
