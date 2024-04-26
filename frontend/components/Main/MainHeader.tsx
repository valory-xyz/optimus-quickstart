import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Badge, Button, Flex } from 'antd';
import { formatUnits } from 'ethers/lib/utils';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

import { Chain, DeploymentStatus } from '@/client';
import { SERVICE_TEMPLATES } from '@/constants';
import { useServiceTemplates, useWallet } from '@/hooks';
import { useServices } from '@/hooks/useServices';
import { ServicesService } from '@/service';
import { WalletService } from '@/service/Wallet';

export const MainHeader = () => {
  const { services, serviceStatus, setServiceStatus } = useServices();
  const { getServiceTemplates } = useServiceTemplates();
  const { totalOlasBalance, totalEthBalance, wallets } = useWallet();

  const [serviceButtonState, setServiceButtonState] = useState({
    isLoading: false,
  });

  const serviceTemplate = useMemo(
    () => getServiceTemplates()[0],
    [getServiceTemplates],
  );

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

  const handleStart = useCallback(async () => {
    setServiceButtonState({ ...serviceButtonState, isLoading: true });

    if (!wallets?.[0]) return;

    if (!wallets?.[0].safe) {
      await WalletService.createSafe(Chain.GNOSIS);
    }

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
  }, [
    serviceButtonState,
    serviceTemplate,
    services,
    setServiceStatus,
    wallets,
  ]);

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
    if (totalOlasBalance === undefined || totalEthBalance === undefined) {
      return (
        <Button type="text" disabled>
          --
        </Button>
      );
    }
    if (
      totalOlasBalance <
        Number(
          formatUnits(
            `${SERVICE_TEMPLATES[0].configuration.olas_cost_of_bond}`,
            18,
          ),
        ) ||
      totalEthBalance <
        Number(
          formatUnits(
            `${SERVICE_TEMPLATES[0].configuration.monthly_gas_estimate}`,
            18,
          ),
        )
    )
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
    serviceButtonState.isLoading,
    serviceStatus,
    handleStop,
    totalOlasBalance,
    totalEthBalance,
    handleStart,
  ]);

  return (
    <Flex justify="start" align="center">
      {agentHead}
      {serviceToggleButton}
    </Flex>
  );
};
