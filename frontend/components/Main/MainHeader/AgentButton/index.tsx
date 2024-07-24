import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Flex, Popover, Typography } from 'antd';
import { useCallback, useMemo } from 'react';

import { Chain, DeploymentStatus } from '@/client';
import { COLOR } from '@/constants/colors';
import { useBalance } from '@/hooks/useBalance';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useServices } from '@/hooks/useServices';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { useStakingContractInfo } from '@/hooks/useStakingContractInfo';
import { useStore } from '@/hooks/useStore';
import { useWallet } from '@/hooks/useWallet';
import { ServicesService } from '@/service/Services';
import { WalletService } from '@/service/Wallet';
import { getMinimumStakedAmountRequired } from '@/utils/service';

import { CannotStartAgent } from '../CannotStartAgent';
import { requiredGas, requiredOlas } from '../constants';

const { Text } = Typography;

const LOADING_MESSAGE =
  "Starting the agent may take a while, so feel free to minimize the app. We'll notify you once it's running. Please, don't quit the app.";

const AgentStartingButton = () => (
  <Popover
    trigger={['hover', 'click']}
    placement="bottomLeft"
    showArrow={false}
    content={
      <Flex vertical={false} gap={8} style={{ maxWidth: 260 }}>
        <Text>
          <InfoCircleOutlined style={{ color: COLOR.BLUE }} />
        </Text>
        <Text>{LOADING_MESSAGE}</Text>
      </Flex>
    }
  >
    <Button type="default" size="large" ghost disabled loading>
      Starting...
    </Button>
  </Popover>
);

const AgentStoppingButton = () => (
  <Button type="default" size="large" ghost disabled loading>
    Stopping...
  </Button>
);

const AgentRunningButton = () => {
  const { service } = useServices();

  const handlePause = useCallback(async () => {
    if (!service) return;
    ServicesService.stopDeployment(service.hash);
  }, [service]);

  return (
    <Flex gap={10} align="center">
      <Button type="default" size="large" onClick={handlePause}>
        Pause
      </Button>
      <Typography.Text type="secondary" className="text-sm loading-ellipses">
        Agent is working
      </Typography.Text>
    </Flex>
  );
};

const AgentNotRunningButton = () => {
  const { wallets, masterSafeAddress } = useWallet();
  const { service, serviceStatus } = useServices();
  const { serviceTemplate } = useServiceTemplates();
  const { showNotification } = useElectronApi();
  const {
    setIsPaused: setIsBalancePollingPaused,
    safeBalance,
    totalOlasStakedBalance,
    totalEthBalance,
  } = useBalance();
  const { storeState } = useStore();
  const { isEligibleForStaking, isAgentEvicted } = useStakingContractInfo();

  const safeOlasBalance = safeBalance?.OLAS;
  const safeOlasBalanceWithStaked =
    safeOlasBalance === undefined || totalOlasStakedBalance === undefined
      ? undefined
      : safeOlasBalance + totalOlasStakedBalance;

  const handleStart = useCallback(async () => {
    if (!wallets?.[0]) return;

    // Paused to stop confusing balance transitions while starting the agent
    setIsBalancePollingPaused(true);

    try {
      if (!masterSafeAddress) {
        await WalletService.createSafe(Chain.GNOSIS);
      }

      await ServicesService.createService({
        serviceTemplate,
        deploy: true,
      });

      if (!service) {
        showNotification?.('Your agent is now running!');
      } else {
        const minimumStakedAmountRequired =
          getMinimumStakedAmountRequired(serviceTemplate);

        showNotification?.(
          `Your agent is running and you've staked ${minimumStakedAmountRequired} OLAS!`,
        );

        // setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBalancePollingPaused(false);
    }
  }, [
    masterSafeAddress,
    serviceTemplate,
    service,
    setIsBalancePollingPaused,
    showNotification,
    wallets,
  ]);

  const isDeployable = useMemo(() => {
    if (serviceStatus === DeploymentStatus.DEPLOYED) return false;
    if (serviceStatus === DeploymentStatus.DEPLOYING) return false;
    if (serviceStatus === DeploymentStatus.STOPPING) return false;

    // case where service exists & user has initial funded
    if (service && storeState?.isInitialFunded) {
      if (!safeOlasBalanceWithStaked) return false;
      // at present agent will always require staked/bonded OLAS (or the ability to stake/bond)
      return safeOlasBalanceWithStaked >= requiredOlas;
    }

    // case if agent is evicted and user has met the staking criteria
    if (isEligibleForStaking && isAgentEvicted) return true;

    const hasEnoughOlas = (safeOlasBalanceWithStaked ?? 0) >= requiredOlas;
    const hasEnoughEth = (totalEthBalance ?? 0) > requiredGas;

    return hasEnoughOlas && hasEnoughEth;
  }, [
    isAgentEvicted,
    isEligibleForStaking,
    safeOlasBalanceWithStaked,
    service,
    serviceStatus,
    storeState?.isInitialFunded,
    totalEthBalance,
  ]);

  const buttonProps: ButtonProps = {
    type: 'primary',
    size: 'large',
    disabled: !isDeployable,
    onClick: isDeployable ? handleStart : undefined,
  };

  const buttonText = `Start agent ${service ? '' : '& stake'}`;

  return <Button {...buttonProps}>{buttonText}</Button>;
};

export const AgentButton = () => {
  const { service, serviceStatus, hasInitialLoaded } = useServices();
  const { isEligibleForStaking, isAgentEvicted } = useStakingContractInfo();

  return useMemo(() => {
    if (!hasInitialLoaded) {
      return <Button type="primary" size="large" disabled loading />;
    }

    if (serviceStatus === DeploymentStatus.STOPPING) {
      return <AgentStoppingButton />;
    }

    if (serviceStatus === DeploymentStatus.DEPLOYING) {
      return <AgentStartingButton />;
    }

    if (serviceStatus === DeploymentStatus.DEPLOYED) {
      return <AgentRunningButton />;
    }

    if (!isEligibleForStaking && isAgentEvicted) return <CannotStartAgent />;

    if (
      !service ||
      serviceStatus === DeploymentStatus.STOPPED ||
      serviceStatus === DeploymentStatus.CREATED ||
      serviceStatus === DeploymentStatus.BUILT ||
      serviceStatus === DeploymentStatus.DELETED
    ) {
      return <AgentNotRunningButton />;
    }

    return (
      <Button type="primary" size="large" disabled>
        Error, contact us!
      </Button>
    );
  }, [
    hasInitialLoaded,
    serviceStatus,
    isEligibleForStaking,
    isAgentEvicted,
    service,
  ]);
};
