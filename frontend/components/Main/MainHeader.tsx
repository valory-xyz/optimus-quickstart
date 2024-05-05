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
            width={40}
            height={40}
          />
        </Badge>
      );
    return (
      <Badge dot offset={[-5, 32.5]}>
        <Image src="/sad-robot.svg" alt="Sad Robot" width={40} height={40} />
      </Badge>
    );
  }, [serviceStatus]);

  const handleStart = useCallback(async () => {
    setServiceButtonState({ isLoading: true });

    if (!wallets?.[0]) return;

    if (!wallets?.[0].safe) {
      await WalletService.createSafe(Chain.GNOSIS);
    }

    if (services.length > 0) {
      return ServicesService.startDeployment(services[0].hash).then(() => {
        setServiceStatus(DeploymentStatus.DEPLOYED);
        setServiceButtonState({ isLoading: false });
      });
    }

    return ServicesService.createService({
      serviceTemplate,
      deploy: true,
    }).then(() => {
      setServiceStatus(DeploymentStatus.DEPLOYED);
      setServiceButtonState({ isLoading: false });
    });
  }, [serviceTemplate, services, setServiceStatus, wallets]);

  const handleStop = useCallback(() => {
    if (services.length === 0) return;
    setServiceButtonState({ isLoading: true });
    ServicesService.stopDeployment(services[0].hash).then(() => {
      setServiceStatus(DeploymentStatus.STOPPED);
      setServiceButtonState({ isLoading: false });
    });
  }, [services, setServiceStatus]);

  const serviceToggleButton = useMemo(() => {
    if (serviceButtonState.isLoading)
      return (
        <Button type="text" size="large" loading>
          Starting...
        </Button>
      );
    if (serviceStatus === DeploymentStatus.DEPLOYED)
      return (
        <Button type="default" size="large" onClick={handleStop}>
          Pause
        </Button>
      );
    if (totalOlasBalance === undefined || totalEthBalance === undefined) {
      return (
        <Button type="primary" size="large" disabled>
          Start agent
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
        <Button type="default" size="large" disabled>
          Start agent
        </Button>
      );
    return (
      <Button type="primary" size="large" onClick={handleStart}>
        Start agent
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
    <Flex justify="start" align="center" gap={10}>
      {agentHead}
      {serviceToggleButton}
    </Flex>
  );
};
