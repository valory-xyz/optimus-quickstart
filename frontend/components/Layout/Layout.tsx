import { PropsWithChildren } from 'react';
import { Navbar } from './Navbar/Navbar';
import { Flex } from 'antd';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Flex vertical>
      <Navbar />
      {children}
    </Flex>
  );
};
