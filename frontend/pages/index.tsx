import { Header } from '@/components/Header';
import { PageState } from '@/context/PageStateProvider';
import { usePageState } from '@/hooks/usePageState';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretUpFilled,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Badge, Button, Flex, Typography, theme } from 'antd';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Receive } from '@/components/Receive';
import { Send } from '@/components/Send';
import { Settings } from '@/components/Settings';
import { Wrapper } from '@/components/Wrapper';
import { useServices } from '@/hooks';
import { useInterval } from 'usehooks-ts';
import { ServicesService } from '@/service';
import { DeploymentStatus } from '@/client';

const { useToken } = theme;

export default function Home() {
  const { pageState } = usePageState();
  const page = useMemo(() => {
    switch (pageState) {
      case PageState.Main:
        return <Main />;
      case PageState.Settings:
        return <Settings />;
      case PageState.Receive:
        return <Receive />;
      case PageState.Send:
        return <Send />;
    }
  }, [pageState]);

  return page;
}

const Main = () => {
  const { token } = useToken();
  const { setPageState } = usePageState();

  const { services } = useServices();

  const [isRunning, setIsRunning] = useState(false);

  const agentHead = useMemo(() => {
    if (isRunning)
      return (
        <Badge status="processing" color="green" dot offset={[-5, 32.5]}>
          <Image
            src="/happy-robot.svg"
            alt="Sad Robot"
            width={35}
            height={35}
          />
        </Badge>
      );
    return (
      <Badge dot offset={[-5, 32.5]}>
        <Image src="/sad-robot.svg" alt="Sad Robot" width={35} height={35} />
      </Badge>
    );
  }, [isRunning]);

  const serviceToggleButton = useMemo(() => {
    if (isRunning)
      return (
        <Button type="text" icon={<PauseCircleOutlined color="red" />}>
          Pause
        </Button>
      );
    return (
      <Button type="text" icon={<PlayCircleOutlined />}>
        Start
      </Button>
    );
  }, [isRunning]);

  const handleStartService = () => {
    if (services.length === 0)
      return ServicesService.createService().then(() => {
        setIsRunning(true);
      });

    return ServicesService.deployService().then(() => {
      setIsRunning(true);
    });
  };

  const handleStopService = () => {
    if (services.length === 0) return;
    ServicesService.stopService(services[0].hash).then(() => {
      setIsRunning(false);
    });
  };

  useInterval(() => {
    if (services.length === 0) {
      setIsRunning(false);
      return;
    }

    if (services[0]) {
      ServicesService.getServiceStatus(services[0].hash).then((res) => {
        res.status === DeploymentStatus.DEPLOYED
          ? setIsRunning(true)
          : setIsRunning(false);
      });
    }
  }, 5000);

  return (
    <>
      <Header>
        {agentHead}

        {serviceToggleButton}

        <Button
          type="text"
          style={{ marginLeft: 'auto' }}
          onClick={() => setPageState(PageState.Settings)}
        >
          <SettingOutlined />
        </Button>
      </Header>
      <Wrapper>
        <Flex vertical>
          <Typography style={{ margin: 0 }}>
            <span style={{ fontSize: 32, fontWeight: 900 }}>$</span>
            <span style={{ fontSize: 64, fontWeight: 900 }}>2,101</span>
          </Typography>
          <Typography.Text>
            24hr change 0.2%{' '}
            <CaretUpFilled style={{ color: token.colorSuccess }} />
          </Typography.Text>
        </Flex>
        <Flex vertical gap={20}>
          <Button
            type="text"
            onClick={() => setPageState(PageState.Receive)}
            style={{ textAlign: 'left', background: token.colorFillSecondary }}
          >
            <ArrowUpOutlined />
            Receive
          </Button>
          <Button
            type="text"
            disabled
            style={{ textAlign: 'left', background: token.colorFillSecondary }}
          >
            <ArrowDownOutlined />
            Send
          </Button>
        </Flex>
      </Wrapper>
    </>
  );
};
