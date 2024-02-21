import { Flex } from 'antd';
import { SettingsButton } from './SettingsButton';
import { NotificationButton } from './NotificationButton';
import Image from 'next/image';

export const Navbar = () => {
  return (
    <Flex vertical={false} justify="space-between" style={{ minWidth: '100%' }}>
      <Image src="/olas-logo.png" alt="" width={100} height={25} />
      <Flex gap={4}>
        <NotificationButton disabled />
        <SettingsButton disabled />
      </Flex>
    </Flex>
  );
};
