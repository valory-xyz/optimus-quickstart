import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Badge, Button, Flex, theme, Typography } from 'antd';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

import { DeploymentStatus } from '@/client';
import { Settings, Setup } from '@/components';
import { Header, Wrapper } from '@/components/Layout';
import { Receive, Send } from '@/components/Wallet';
import { serviceTemplates } from '@/constants';
import { PageState } from '@/enums';
import { usePageState, useServices, useWallet } from '@/hooks';
import { ServicesService } from '@/service';

const { useToken } = theme;

export default function Home() {
  const { pageState } = usePageState();
  const page = useMemo(() => {
    switch (pageState) {
      case PageState.Setup:
        return <Setup />;
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
  const { services, serviceStatus, setServiceStatus } = useServices();
  const { balance } = useWallet();

  const [serviceButtonState, setServiceButtonState] = useState({
    isLoading: false,
  });

  const serviceTemplate = useMemo(() => serviceTemplates[0], []);

  const agentHead = useMemo(() => {
    if (serviceStatus === DeploymentStatus.DEPLOYED)
      return (
        <Badge status="processing" color="green" dot offset={[-5, 32.5]}>
          <Image
            src="/happy-robot.svg"
            alt="Happy Robot"
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
  }, [serviceStatus]);

  const handleStart = useCallback(() => {
    setServiceButtonState({ ...serviceButtonState, isLoading: true });
    if (services.length > 0) {
      return ServicesService.startDeployment(services[0].hash).then(() => {
        setServiceStatus(DeploymentStatus.DEPLOYED);
        setServiceButtonState({ ...serviceButtonState, isLoading: false });
      });
    }
    return ServicesService.createService({
      serviceTemplate,
      deploy: true,
    }).then(() => {
      setServiceStatus(DeploymentStatus.DEPLOYED);
      setServiceButtonState({ ...serviceButtonState, isLoading: false });
    });
  }, [serviceButtonState, serviceTemplate, services, setServiceStatus]);

  const handleStop = useCallback(() => {
    if (services.length === 0) return;
    setServiceButtonState((prev) => ({ ...prev, isLoading: true }));
    ServicesService.stopDeployment(services[0].hash).then(() => {
      setServiceStatus(DeploymentStatus.STOPPED);
      setServiceButtonState((prev) => ({ ...prev, isLoading: false }));
    });
  }, [services, setServiceStatus]);

  const serviceToggleButton = useMemo(() => {
    if (serviceButtonState.isLoading)
      return (
        <Button type="text" loading>
          Loading
        </Button>
      );
    if (serviceStatus === DeploymentStatus.DEPLOYED)
      return (
        <Button
          type="text"
          icon={<PauseCircleOutlined color="red" />}
          onClick={handleStop}
        >
          Pause
        </Button>
      );
    if (balance === undefined) {
      return (
        <Button type="text" disabled>
          RPC Error
        </Button>
      );
    }
    if (balance < 1)
      return (
        <Button type="text" disabled>
          Not funded
        </Button>
      );
    return (
      <Button type="text" icon={<PlayCircleOutlined />} onClick={handleStart}>
        Start
      </Button>
    );
  }, [
    balance,
    handleStart,
    handleStop,
    serviceButtonState.isLoading,
    serviceStatus,
  ]);

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
        <Button type="text" disabled>
          <MinusOutlined />
        </Button>
      </Header>
      <Wrapper>
        <Flex vertical>
          <Typography style={{ margin: 0 }}>
            <span style={{ fontSize: 32, fontWeight: 900 }}>$</span>
            <span style={{ fontSize: 64, fontWeight: 900 }}>
              {balance === undefined ? '--' : balance.toFixed(2)}
            </span>
          </Typography>
          <Typography
            style={{ display: 'flex', flexWrap: 'nowrap', fontSize: 18 }}
          >
            <span style={{ display: 'flex', flexWrap: 'nowrap' }}>
              24hr change -- %
            </span>
          </Typography>
        </Flex>
        <Flex vertical gap={20} style={{ marginLeft: 'auto' }}>
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
