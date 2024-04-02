import { Flex } from 'antd';
import { PropsWithChildren } from 'react';

export const Header = ({ children }: PropsWithChildren) => {
  return (
    <Flex
      style={{
        borderBottom: '1px lightgrey solid',
        padding: '10px 20px',
        minHeight: 40,
        maxHeight: 40,
        alignItems: 'center',
        gap: 10,
      }}
    >
      {children}
    </Flex>
  );
};
