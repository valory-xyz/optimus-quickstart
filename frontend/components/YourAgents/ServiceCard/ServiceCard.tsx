import {
  Card,
  Flex,
  Typography,
  Button,
  Badge,
  Spin,
  message,
  Tooltip,
} from 'antd';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import {
  Deployment,
  DeploymentStatus,
  Service,
  ServiceHash,
  ServiceTemplate,
} from '@/client';
import { useMarketplace, useServices, useEthers } from '@/hooks';

import { ServiceCardTotalBalance } from './ServiceCardTotalBalance';
import {
  SERVICE_CARD_RPC_POLLING_INTERVAL,
  SERVICE_CARD_STATUS_POLLING_INTERVAL,
} from '@/constants/intervals';

type ServiceCardProps = {
  service: Service;
};

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const {
    stopService,
    deployService,
    deleteServices,
    updateServiceState,
    getServiceStatus,
    deleteServiceState,
  } = useServices();
  const { getServiceTemplates } = useMarketplace();
  const { checkRpc } = useEthers();

  const [serviceStatus, setServiceStatus] = useState<
    DeploymentStatus | undefined
  >();

  const [isStopping, setIsStopping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRpcValid, setIsRpcValid] = useState<boolean | undefined>(); //undefined state assumes this check has not been performed yet

  const updateServiceStatus = useCallback(
    (serviceHash: ServiceHash): Promise<void> =>
      getServiceStatus(serviceHash)
        .then((r: Deployment) => setServiceStatus(r.status))
        .catch(() => {
          setServiceStatus(undefined);
        }),
    [getServiceStatus],
  );

  useInterval(
    () => updateServiceStatus(service.hash),
    SERVICE_CARD_STATUS_POLLING_INTERVAL,
  );

  const handleStart = useCallback(() => {
    if (isStarting) return;
    setIsStarting(true);
    deployService(service.hash)
      .then(async () => {
        message.success('Service started successfully');
        updateServiceState(service.hash).catch(() =>
          message.error('Failed to update services'),
        );
      })
      .catch(() => {
        message.error('Failed to start service');
      })
      .finally(() => {
        updateServiceStatus(service.hash)
          .catch(() => message.error('Failed to update service status'))
          .finally(() => setIsStarting(false));
      });
  }, [
    isStarting,
    deployService,
    service.hash,
    updateServiceState,
    updateServiceStatus,
  ]);

  const handleStop = useCallback(async (): Promise<void> => {
    if (isStopping) return;
    setIsStopping(true);
    stopService(service.hash)
      .then(() => {
        updateServiceState(service.hash).catch(() =>
          message.error('Failed to update services'),
        );
      })
      .catch(() => {
        message.error('Failed to stop service');
      })
      .finally(() => {
        updateServiceStatus(service.hash)
          .catch(() => message.error('Failed to update service status'))
          .finally(() => setIsStopping(false));
      });
  }, [
    isStopping,
    service.hash,
    stopService,
    updateServiceState,
    updateServiceStatus,
  ]);

  const handleDelete = useCallback(() => {
    if (isDeleting) return;
    setIsDeleting(true);
    deleteServices([service.hash])
      .catch(() => message.error('Failed to delete service'))
      .finally(() => {
        deleteServiceState(service.hash);
      });
  }, [deleteServiceState, deleteServices, isDeleting, service.hash]);

  const buttons: JSX.Element = useMemo(() => {
    if (serviceStatus === DeploymentStatus.DEPLOYED) {
      return (
        <Button
          danger
          onClick={handleStop}
          disabled={isStopping}
          loading={isStopping}
        >
          Stop this agent
        </Button>
      );
    }
    if (
      serviceStatus === DeploymentStatus.STOPPED ||
      serviceStatus === DeploymentStatus.BUILT
    ) {
      return (
        <Flex gap={16}>
          <Button
            type="primary"
            onClick={handleStart}
            disabled={isStarting}
            loading={isStarting}
          >
            Start this agent
          </Button>
          <Button
            danger
            onClick={handleDelete}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Delete this agent
          </Button>
        </Flex>
      );
    }
    return <Spin />;
  }, [
    handleDelete,
    handleStart,
    handleStop,
    isDeleting,
    isStarting,
    isStopping,
    serviceStatus,
  ]);

  const serviceTemplate: ServiceTemplate | undefined = useMemo(
    () =>
      getServiceTemplates().find(
        (serviceTemplate) => serviceTemplate.hash === service.hash,
      ),
    [getServiceTemplates, service.hash],
  );

  const showRpc = useMemo(
    () => !isRpcValid && isRpcValid !== undefined,
    [isRpcValid],
  );

  useInterval(
    async () => setIsRpcValid(await checkRpc(service.ledger.rpc)),
    SERVICE_CARD_RPC_POLLING_INTERVAL,
  );

  if (!serviceTemplate) return <ServiceTemplateNotFound />;

  return (
    <Card>
      {showRpc && (
        <div style={{ position: 'absolute', top: -8, right: -8 }}>
          <Tooltip title="RPC is not responding" placement="left">
            <Badge count={'!'} status="error" />
            {/* Using count to render react node inside badge */}
          </Tooltip>
        </div>
      )}

      <Flex gap={16}>
        <Image
          src={serviceTemplate.image}
          alt="Image"
          width={200}
          height={200}
          unoptimized
        />
        <Flex vertical>
          <Typography.Title level={3}>{serviceTemplate.name}</Typography.Title>
          <Typography.Text>{serviceTemplate.description}</Typography.Text>
          <Flex gap={'large'} justify="space-between">
            <Flex vertical>
              <Typography.Text strong>STATUS</Typography.Text>
              <ServiceCardStatusBadge serviceStatus={serviceStatus} />
            </Flex>
            {isRpcValid && <ServiceCardTotalBalance service={service} />}
          </Flex>
          <Flex style={{ marginTop: 'auto' }}>{buttons}</Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

const ServiceCardStatusBadge = ({
  serviceStatus,
}: {
  serviceStatus?: DeploymentStatus;
}) => {
  const badge = useMemo(() => {
    switch (serviceStatus) {
      case DeploymentStatus.CREATED:
        return <Badge status="processing" text="Created" />;
      case DeploymentStatus.BUILT:
        return <Badge status="processing" text="Ready" />;
      case DeploymentStatus.DEPLOYING:
        return <Badge status="processing" text="Deploying" />;
      case DeploymentStatus.DEPLOYED:
        return <Badge status="success" text="Running" />;
      case DeploymentStatus.STOPPING:
        return <Badge status="processing" text="Stopping" />;
      case DeploymentStatus.STOPPED:
        return <Badge status="error" text="Stopped" />;
      case DeploymentStatus.DELETED:
        return <Badge status="error" text="Deleted" />;
      default:
        return <Badge status="processing" text="Loading" />;
    }
  }, [serviceStatus]);
  return badge;
};

const ServiceTemplateNotFound = () => {
  return (
    <Card>
      <Flex gap={16}>
        <Typography.Text>Service template not found</Typography.Text>
      </Flex>
    </Card>
  );
};
