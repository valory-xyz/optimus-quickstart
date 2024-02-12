import { SERVICE_META } from "@/constants/serviceMeta";
import { useServices } from "@/hooks/useServices";
import { Service } from "@/types/Service";
import { Card, Flex, Typography, Button, Badge } from "antd";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

type ServiceCardProps = {
  service: Service;
};

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const { stopService, startService, deleteService, updateServices } =
    useServices();

  const [isStopping, setIsStopping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStart = useCallback(() => {
    setIsStarting(true);
    startService(service.hash)
      .then(async () => {
        await updateServices();
      })
      .finally(() => {
        setIsStarting(false);
      });
  }, [service.hash, startService, updateServices]);

  const handleStop = useCallback(() => {
    setIsStopping(true);
    stopService(service.hash)
      .then(async () => {
        await updateServices();
      })
      .finally(() => {
        setIsStopping(false);
      });
  }, [service.hash, stopService, updateServices]);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    deleteService(service.hash)
      .then(async () => {
        await updateServices();
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }, [deleteService, service.hash, updateServices]);

  const button = useMemo(() => {
    if (service.running) {
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
    if (!service.running) {
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
    return null;
  }, [
    handleDelete,
    handleStart,
    handleStop,
    isDeleting,
    isStarting,
    isStopping,
    service.running,
  ]);

  const serviceStatus = useMemo(() => {
    if (service.running) {
      return <Badge status="success" text="Running" />;
    }
    if (!service.running) {
      return <Badge status="error" text="Stopped" />;
    }
    return <Badge status="warning" text="Error" />;
  }, [service.running]);

  const serviceMeta = useMemo(() => SERVICE_META[service.name], [service.name]);

  return (
    <Card>
      <Flex gap={16}>
        <Image
          src={serviceMeta.image_src}
          alt="Image"
          width={200}
          height={200}
        />
        <Flex vertical>
          <Typography.Title level={3}>{serviceMeta.name}</Typography.Title>
          <Typography.Text>{serviceMeta.description}</Typography.Text>
          <Flex gap={"large"} justify="space-between">
            <Flex vertical>
              <Typography.Text strong>STATUS</Typography.Text>
              <Typography.Text>{serviceStatus}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>EARNINGS 24H</Typography.Text>
              <Typography.Text>$ {service.earnings_24h || 0}</Typography.Text>
            </Flex>
            <Flex vertical>
              <Typography.Text strong>TOTAL BALANCE</Typography.Text>
              <Typography.Text>$ {service.total_balance || 0}</Typography.Text>
            </Flex>
          </Flex>
          <Flex style={{ marginTop: "auto" }}>{button}</Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
