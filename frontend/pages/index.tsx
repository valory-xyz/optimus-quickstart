import { MessageOutlined, SettingOutlined } from '@ant-design/icons';
import { Badge, Button, Flex } from 'antd';
import Image from 'next/image';
import { useMemo, useState } from 'react';

enum PageState {
  Main,
  Settings,
  Details,
  Wallet,
}

export default function Home() {
  const [pageState, setPageState] = useState<PageState>(PageState.Main);

  const page = useMemo(() => {
    switch (pageState) {
      case PageState.Main:
        return <Main />;
      case PageState.Settings:
        return <Settings />;
      case PageState.Details:
        return <Details />;
      case PageState.Wallet:
        return <Wallet />;
    }
  }, [pageState]);

  return page;
}

const Main = () => {
  return (
    <>
      <Flex>
        <Badge dot offset={[-5, 32.5]}>
          <Image src="/sad-robot.svg" alt="Sad Robot" width={35} height={35} />
        </Badge>
        <Button>Start</Button>
        <Button type="text">
          <MessageOutlined />
          Chat
        </Button>
        <Button type="text" href="/settings" target="_blank">
          <SettingOutlined />
        </Button>
      </Flex>
    </>
  );
};

const Settings = () => {
  return (
    <>
      <Flex>
        <Button>Settings</Button>
      </Flex>
    </>
  );
};
