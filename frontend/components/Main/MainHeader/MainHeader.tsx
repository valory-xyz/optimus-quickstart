import { Badge, Button, Flex, Typography } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Chain, DeploymentStatus } from '@/client';
import { LOW_BALANCE } from '@/constants';
import { useBalance, useServiceTemplates } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useReward } from '@/hooks/useReward';
import { useServices } from '@/hooks/useServices';
import { useStore } from '@/hooks/useStore';
import { useWallet } from '@/hooks/useWallet';
import { ServicesService } from '@/service';
import { WalletService } from '@/service/Wallet';
import { useStakingContractInfo } from '@/store/useStakingContractInfo';

import {
  AgentEvictedPopover,
  NoJobsAvailablePopover,
  NoRewardsAvailablePopover,
  StartingButtonPopover,
} from './components';
import { requiredGas, requiredOlas } from './constants';
import { FirstRunModal } from './FirstRunModal';

enum ServiceButtonLoadingState {
  Starting,
  Pausing,
  NotLoading,
}

const useSetupTrayIcon = () => {
  const { safeBalance } = useBalance();
  const { serviceStatus } = useServices();
  const { setTrayIcon } = useElectronApi();

  useEffect(() => {
    if (safeBalance && safeBalance.ETH < LOW_BALANCE) {
      setTrayIcon?.('low-gas');
    } else if (serviceStatus === DeploymentStatus.DEPLOYED) {
      setTrayIcon?.('running');
    } else if (serviceStatus === DeploymentStatus.STOPPED) {
      setTrayIcon?.('paused');
    }
  }, [safeBalance, serviceStatus, setTrayIcon]);

  return null;
};

export const MainHeader = () => {
  const { storeState } = useStore();
  const { services, serviceStatus, setServiceStatus } = useServices();
  const { showNotification } = useElectronApi();
  const { getServiceTemplates } = useServiceTemplates();
  const { wallets, masterSafeAddress } = useWallet();
  const {
    safeBalance,
    totalOlasStakedBalance,
    totalEthBalance,
    isBalanceLoaded,
    setIsPaused: setIsBalancePollingPaused,
  } = useBalance();
  const { canStartAgent } = useStakingContractInfo();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalClose = useCallback(() => setIsModalOpen(false), []);

  // hook to setup tray icon
  useSetupTrayIcon();

  const { minimumStakedAmountRequired } = useReward();

  const {
    isStakingContractInfoLoading,
    hasEnoughServiceSlots,
    isRewardsAvailable,
    isAgentEvicted,
    fetchStakingContractInfo,
  } = useStakingContractInfo();

  useEffect(() => {
    fetchStakingContractInfo();
  }, [fetchStakingContractInfo]);

  const safeOlasBalanceWithStaked = useMemo(() => {
    if (safeBalance?.OLAS === undefined) return;
    if (totalOlasStakedBalance === undefined) return;
    return totalOlasStakedBalance + safeBalance.OLAS;
  }, [safeBalance?.OLAS, totalOlasStakedBalance]);

  const [serviceButtonState, setServiceButtonState] =
    useState<ServiceButtonLoadingState>(ServiceButtonLoadingState.NotLoading);

  const serviceTemplate = useMemo(
    () => getServiceTemplates()[0],
    [getServiceTemplates],
  );

  const agentHead = useMemo(() => {
    if (
      serviceButtonState === ServiceButtonLoadingState.Starting ||
      serviceButtonState === ServiceButtonLoadingState.Pausing
    )
      return (
        <Badge status="processing" color="orange" dot offset={[-5, 32.5]}>
          <Image
            src="/happy-robot.svg"
            alt="Happy Robot"
            width={40}
            height={40}
          />
        </Badge>
      );
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
  }, [serviceButtonState, serviceStatus]);

  const handleStart = useCallback(async () => {
    if (!wallets?.[0]) return;

    setServiceButtonState(ServiceButtonLoadingState.Starting);
    setIsBalancePollingPaused(true);

    try {
      if (!masterSafeAddress) {
        await WalletService.createSafe(Chain.GNOSIS);
      }
      // TODO: Replace with proper upload logic
      // if (services.length > 0) {
      //   return ServicesService.startDeployment(services[0].hash).then(() => {
      //     setServiceStatus(DeploymentStatus.DEPLOYED);
      //     setIsBalancePollingPaused(false);
      //     setServiceButtonState({ isLoading: false });
      //   });
      // }

      const serviceExists = !!services?.[0];

      // For now POST /api/services will take care of creating, starting and updating the service
      return ServicesService.createService({
        serviceTemplate,
        deploy: true,
      })
        .then(() => {
          setServiceStatus(DeploymentStatus.DEPLOYED);
          if (serviceExists) {
            showNotification?.('Your agent is now running!');
          } else {
            showNotification?.(
              `Your agent is running and you've staked ${minimumStakedAmountRequired} OLAS!`,
            );
            setIsModalOpen(true);
          }
        })
        .finally(() => {
          setIsBalancePollingPaused(false);
          setServiceButtonState(ServiceButtonLoadingState.NotLoading);
        });
    } catch (error) {
      setIsBalancePollingPaused(false);
      setServiceButtonState(ServiceButtonLoadingState.NotLoading);
    }
  }, [
    masterSafeAddress,
    minimumStakedAmountRequired,
    serviceTemplate,
    services,
    setIsBalancePollingPaused,
    setServiceStatus,
    showNotification,
    wallets,
  ]);

  const handlePause = useCallback(() => {
    if (!services) return;
    if (services.length === 0) return;
    setServiceButtonState(ServiceButtonLoadingState.Pausing);
    ServicesService.stopDeployment(services[0].hash).then(() => {
      setServiceStatus(DeploymentStatus.STOPPED);
      setServiceButtonState(ServiceButtonLoadingState.NotLoading);
    });
  }, [services, setServiceStatus]);

  const serviceToggleButton = useMemo(() => {
    if (serviceButtonState === ServiceButtonLoadingState.Pausing) {
      return (
        <Button type="default" size="large" ghost disabled loading>
          Stopping...
        </Button>
      );
    }

    if (serviceButtonState === ServiceButtonLoadingState.Starting) {
      return <StartingButtonPopover />;
    }

    if (serviceStatus === DeploymentStatus.DEPLOYED) {
      return (
        <Flex gap={10} align="center">
          <Button type="default" size="large" onClick={handlePause}>
            Pause
          </Button>
          <Typography.Text
            type="secondary"
            className="text-sm loading-ellipses"
          >
            Agent is working
          </Typography.Text>
        </Flex>
      );
    }

    if (!isBalanceLoaded) {
      return (
        <Button type="primary" size="large" disabled>
          Start agent
        </Button>
      );
    }

    const isDeployable = (() => {
      // case where required values are undefined (not fetched from the server)
      if (totalEthBalance === undefined) return false;
      if (safeOlasBalanceWithStaked === undefined) return false;
      if (!services) return false;

      // deployment statuses where agent should not be deployed
      // if (serviceStatus === DeploymentStatus.DEPLOYED) return false; // condition already checked above
      if (serviceStatus === DeploymentStatus.DEPLOYING) return false;
      if (serviceStatus === DeploymentStatus.STOPPING) return false;

      // case where service exists & user has initial funded
      if (services[0] && storeState?.isInitialFunded)
        return safeOlasBalanceWithStaked >= requiredOlas; // at present agent will always require staked/bonded OLAS (or the ability to stake/bond)

      return (
        safeOlasBalanceWithStaked >= requiredOlas &&
        totalEthBalance > requiredGas
      );
    })();

    const serviceExists = !!services?.[0];

    if (!isDeployable) {
      return (
        <Button type="default" size="large" disabled>
          Start agent {!serviceExists && '& stake'}
        </Button>
      );
    }

    return (
      <Button
        type="primary"
        size="large"
        disabled={!canStartAgent}
        onClick={handleStart}
      >
        Start agent {!serviceExists && '& stake'}
      </Button>
    );
  }, [
    handlePause,
    handleStart,
    isBalanceLoaded,
    safeOlasBalanceWithStaked,
    serviceButtonState,
    serviceStatus,
    services,
    storeState?.isInitialFunded,
    totalEthBalance,
    canStartAgent,
  ]);

  const cannotStartAgent = useMemo(() => {
    if (canStartAgent) return null;
    if (!hasEnoughServiceSlots) return <NoJobsAvailablePopover />;
    if (!isRewardsAvailable) return <NoRewardsAvailablePopover />;
    if (isAgentEvicted) return <AgentEvictedPopover />;
    throw new Error('Cannot start agent, please contact support');
  }, [
    canStartAgent,
    isRewardsAvailable,
    isAgentEvicted,
    hasEnoughServiceSlots,
  ]);

  return (
    <Flex justify="start" align="center" gap={10}>
      {agentHead}
      {isStakingContractInfoLoading ? null : (
        <>{canStartAgent ? serviceToggleButton : cannotStartAgent}</>
      )}
      <FirstRunModal open={isModalOpen} onClose={handleModalClose} />
    </Flex>
  );
};
