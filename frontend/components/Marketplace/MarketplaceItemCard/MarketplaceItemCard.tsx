import { ServiceTemplate } from "@/client";
import { useServices } from "@/hooks";
import { Button, Typography, Flex, Card } from "antd";
import Image from "next/image";
import { useMemo } from "react";

export const MarketplaceItemCard = ({
  serviceTemplate,
  marginBottom,
}: {
  serviceTemplate: ServiceTemplate;
  marginBottom?: number;
}) => {
  const { getServiceFromState, hasInitialLoaded } = useServices();
  const { name, description, image, hash } = serviceTemplate;

  const button = useMemo(() => {
    if (!hasInitialLoaded) return <Button loading disabled></Button>;

    const service = getServiceFromState(hash);

    if (!service)
      return (
        <Button type="primary" href={`/spawn/${hash}`}>
          Run Agent
        </Button>
      );

    return (
      <Button type="primary" disabled>
        Already Running
      </Button>
    );
  }, [getServiceFromState, hasInitialLoaded, hash]);

  return (
    <Card style={{ marginBottom }}>
      <Flex gap={16}>
        <Image src={image} alt="Image" width={200} height={200} unoptimized />
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
