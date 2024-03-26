import { Header } from '@/components/Layout/Header';
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
import { useCallback, useMemo, useState } from 'react';
import { Receive } from '@/components/Wallet/Receive';
import { useServices } from '@/hooks';
import { useInterval } from 'usehooks-ts';
import { ServicesService } from '@/service';
import { DeploymentStatus } from '@/client';
import { serviceTemplates } from '@/constants';
import { Settings } from '@/components/Settings';
import { Send } from '@/components/Wallet/Send';
import { Wrapper } from '@/components/Layout/Wrapper';
import { Setup } from '@/components/Setup';
import { Login } from '@/components/Login';

const { useToken } = theme;

export default function Home() {
  const { pageState } = usePageState();
  const page = useMemo(() => {
    switch (pageState) {
      case PageState.Setup:
        return <Setup />;
      case PageState.Login:
        return <Login />;
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

  const [serviceButtonState, setServiceButtonState] = useState({
    isLoading: false,
    isRunning: false,
  });

  const serviceTemplate = useMemo(() => serviceTemplates[0], []);

  const agentHead = useMemo(() => {
    if (serviceButtonState.isRunning)
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
  }, [serviceButtonState.isRunning]);

  const handleStart = useCallback(() => {
    setServiceButtonState({ ...serviceButtonState, isLoading: true });
    if (services.length > 0) {
      ServicesService.startDeployment(services[0].hash).then(() => {
        setServiceButtonState({ ...serviceButtonState, isRunning: true });
      });
    }
    ServicesService.createService({ serviceTemplate, deploy: true }).then(
      () => {
        setServiceButtonState({ ...serviceButtonState, isLoading: false });
      },
    );
  }, [serviceButtonState, serviceTemplate, services]);

  const handleStop = useCallback(() => {
    if (services.length === 0) return;
    setServiceButtonState({ ...serviceButtonState, isLoading: true });
    ServicesService.stopDeployment(services[0].hash).then(() => {
      setServiceButtonState((prev) => ({ ...prev, isRunning: false }));
    });
  }, [serviceButtonState, services]);

  const serviceToggleButton = useMemo(() => {
    if (serviceButtonState.isLoading)
      return (
        <Button type="text" loading>
          Loading
        </Button>
      );
    if (serviceButtonState.isRunning)
      return (
        <Button
          type="text"
          icon={<PauseCircleOutlined color="red" />}
          onClick={handleStop}
        >
          Pause
        </Button>
      );
    return (
      <Button type="text" icon={<PlayCircleOutlined />} onClick={handleStart}>
        Start
      </Button>
    );
  }, [handleStart, handleStop, serviceButtonState]);

  useInterval(() => {
    if (services.length <= 0) {
      setServiceButtonState({ isLoading: false, isRunning: false });
      return;
    }

    if (services[0]) {
      ServicesService.getServiceStatus(services[0].hash).then((res) => {
        res.status === DeploymentStatus.DEPLOYED
          ? setServiceButtonState((prev) => ({ ...prev, isRunning: true }))
          : setServiceButtonState((prev) => ({ ...prev, isRunning: false }));
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
          <Typography
            style={{ display: 'flex', flexWrap: 'nowrap', fontSize: 18 }}
          >
            <span style={{ display: 'flex', flexWrap: 'nowrap' }}>
              24hr change 0.2%
            </span>
            <CaretUpFilled style={{ color: token.colorSuccess }} />
          </Typography>
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
