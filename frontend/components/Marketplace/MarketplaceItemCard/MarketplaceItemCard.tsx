import { ServiceTemplate } from "@/client";
import { Button, Typography, Flex, Card } from "antd";
import Image from "next/image";

export const MarketplaceItemCard = ({
  serviceTemplate,
  marginBottom,
}: {
  serviceTemplate: ServiceTemplate;
  marginBottom?: number;
}) => {
  const { name, description, image, hash } = serviceTemplate;

  return (
    <Card style={{ marginBottom }}>
      <Flex gap={16}>
        <Image src={image} alt="Image" width={200} height={200} />
        <Flex vertical>
          <Flex vertical style={{ height: "100%" }}>
            <Typography.Title level={3}>{name}</Typography.Title>
            <Typography.Text>{description}</Typography.Text>
            <Flex style={{ marginTop: "auto" }}>
              <Button type="primary" href={`/spawn/${hash}`}>
                Run Agent
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
