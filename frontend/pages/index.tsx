import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretUpFilled,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Badge, Button, Flex, theme, Typography } from 'antd';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { DeploymentStatus } from '@/client';
import { Login, Settings, Setup } from '@/components';
import { Header, Wrapper } from '@/components/Layout';
import { Receive, Send } from '@/components/Wallet';
import { serviceTemplates } from '@/constants';
import { PageState } from '@/enums';
import { usePageState, useServices, useUserBalance } from '@/hooks';
import { ServicesService } from '@/service';

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
      default:
        return <></>;
    }
  }, [pageState]);

  return page;
}

const Main = () => {
  const { token } = useToken();
  const { setPageState } = usePageState();
  const { services } = useServices();
  const { balance } = useUserBalance();

  const [serviceButtonState, setServiceButtonState] = useState({
    isFunded: false,
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
      return ServicesService.startDeployment(services[0].hash).then(() => {
        setServiceButtonState({ ...serviceButtonState, isRunning: true });
      });
    }
    return ServicesService.createService({
      serviceTemplate,
      deploy: true,
    }).then(() => {
      setServiceButtonState({ ...serviceButtonState, isLoading: false });
    });
  }, [serviceButtonState, serviceTemplate, services]);

  const handleStop = useCallback(() => {
    if (services.length === 0) return;
    setServiceButtonState({ ...serviceButtonState, isLoading: true });
    ServicesService.stopDeployment(services[0].hash).then(() => {
      setServiceButtonState((prev) => ({ ...prev, isRunning: false }));
    });
  }, [serviceButtonState, services]);

  const serviceToggleButton = useMemo(() => {
    if (!serviceButtonState.isFunded)
      return (
        <Button type="text" disabled>
          Not funded
        </Button>
      );
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

  // Service button interval
  useInterval(() => {
    setServiceButtonState((prev) => ({ ...prev, isFunded: balance >= 1 }));

    if (services.length <= 0) {
      setServiceButtonState((prev) => ({
        ...prev,
        isLoading: false,
        isRunning: false,
      }));
      return;
    }

    if (services[0]) {
      ServicesService.getDeployment(services[0].hash).then((res) => {
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
            <span style={{ fontSize: 64, fontWeight: 900 }}>
              {balance.toFixed(2)}
            </span>
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
