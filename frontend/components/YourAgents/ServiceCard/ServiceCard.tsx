import { DeploymentStatus, Service } from "@/client";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useServices } from "@/hooks/useServices";
import { Card, Flex, Typography, Button, Badge, Spin } from "antd";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

type ServiceCardProps = {
  service: Service;
};

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const {
    stopService,
    deployService,
    deleteServices,
    updateServicesState,
    getServiceStatus,
  } = useServices();
  const { getServiceTemplates } = useMarketplace();

  const { data: serviceStatusData } = useSWR(
    service.hash,
    () => getServiceStatus(service.hash),
    {},
  );
  const serviceStatus = serviceStatusData?.status;

  const [isStopping, setIsStopping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStart = useCallback(() => {
    setIsStarting(true);
    deployService(service.hash)
      .then(async () => {
        await updateServicesState();
      })
      .finally(() => {
        setIsStarting(false);
      });
  }, [service.hash, deployService, updateServicesState]);

  const handleStop = useCallback(() => {
    setIsStopping(true);
    stopService(service.hash)
      .then(async () => {
        await updateServicesState();
      })
      .finally(() => {
        setIsStopping(false);
      });
  }, [service.hash, stopService, updateServicesState]);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    deleteServices([service.hash])
      .then(async () => {
        await updateServicesState();
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }, [deleteServices, service.hash, updateServicesState]);

  const button = useMemo(() => {
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

  const serviceStatusBadge = useMemo(() => {
    if (serviceStatus === DeploymentStatus.DEPLOYED) {
      return <Badge status="success" text="Running" />;
    }
    if (serviceStatus === DeploymentStatus.STOPPED) {
      return <Badge status="error" text="Stopped" />;
    }
    return <Badge status="warning" text="Error" />;
  }, [serviceStatus]);

  const serviceTemplate = useMemo(
    () =>
      getServiceTemplates().find(
        (serviceTemplate) => serviceTemplate.hash === service.hash,
      ),
    [getServiceTemplates, service.hash],
  );

  return (
    <Card>
      <Flex gap={16}>
        <Image
          src={serviceTemplate!.image}
          alt="Image"
          width={200}
          height={200}
        />
        <Flex vertical>
          <Typography.Title level={3}>{serviceTemplate!.name}</Typography.Title>
          <Typography.Text>{serviceTemplate!.description}</Typography.Text>
          <Flex gap={"large"} justify="space-between">
            <Flex vertical>
              <Typography.Text strong>STATUS</Typography.Text>
              <Typography.Text>{serviceStatus}</Typography.Text>
            </Flex>
            {/* <Flex vertical>
              <Typography.Text strong>EARNINGS 24H</Typography.Text>
              <Typography.Text>$ {service.earnings_24h || 0}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>TOTAL BALANCE</Typography.Text>
              <Typography.Text>$ {service.total_balance || 0}</Typography.Text>
            </Flex> */}
          </Flex>
          <Flex style={{ marginTop: "auto" }}>{button}</Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
