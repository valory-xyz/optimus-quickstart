import { Flex } from 'antd';
import { PropsWithChildren } from 'react';

export const Wrapper = ({ children }: PropsWithChildren) => {
  return (
    <Flex style={{ padding: 20, alignItems: 'center', gap: 10 }}>
      {children}
    </Flex>
  );
};
