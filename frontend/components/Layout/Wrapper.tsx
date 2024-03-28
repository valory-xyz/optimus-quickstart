import { Flex } from 'antd';
import { PropsWithChildren } from 'react';

export const Wrapper = ({
  children,
  vertical,
}: PropsWithChildren & { vertical?: boolean }) => {
  return (
    <Flex
      style={{ padding: 20, alignItems: 'center', gap: 10 }}
      vertical={vertical}
    >
      {children}
    </Flex>
  );
};
