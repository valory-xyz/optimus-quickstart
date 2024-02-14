import { Tab } from "@/enums";
import { useTabs } from "@/hooks/useTabs";
import { Service } from "@/types/Service";
import { ServiceMeta } from "@/types/ServiceMeta";
import { Button, Typography, Flex, Card } from "antd";
import Image from "next/image";
import { useMemo } from "react";
export const MarketplaceItemCard = ({
  serviceMeta,
  service,
  marginBottom,
}: {
  serviceMeta: ServiceMeta;
  service: Service;
  marginBottom?: number;
}) => {
  const { name, description, image_src } = serviceMeta;
  const { setActiveTab } = useTabs();

  const button = useMemo(() => {
    if (service.running) {
      return (
        <Button type="primary" onClick={() => setActiveTab(Tab.YOUR_AGENTS)}>
          View Agent
        </Button>
      );
    }
    return (
      <Button type="primary" href={`/spawn/${service.hash}`}>
        Run Agent
      </Button>
    );
  }, [service.hash, service.running, setActiveTab]);

  return (
    <Card style={{ marginBottom }}>
      <Flex gap={16}>
        <Image src={image_src} alt="Image" width={200} height={200} />
        <Flex vertical>
          <Flex vertical style={{ height: "100%" }}>
            <Typography.Title level={3}>{name}</Typography.Title>
            <Typography.Text>{description}</Typography.Text>
            <Flex style={{ marginTop: "auto" }}>{button}</Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
