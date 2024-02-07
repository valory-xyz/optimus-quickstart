import { MarketplaceItem } from "@/types/MarketplaceItem";
import { Button, Typography, Flex, Card } from "antd";
import Image from "next/image";
export const MarketplaceItemCard = ({
  marketplaceItem,
  marginBottom,
}: {
  marketplaceItem: MarketplaceItem;
  marginBottom?: number;
}) => {
  const { name, description, image_src } = marketplaceItem;
  return (
    <Card style={{ marginBottom }}>
      <Flex gap={16}>
        <Image src={image_src} alt="Image" width={200} height={200} />
        <Flex vertical>
          <Flex vertical style={{ height: "100%" }}>
            <Typography.Title level={3}>{name}</Typography.Title>
            <Typography.Text>{description}</Typography.Text>
            <Flex style={{ marginTop: "auto" }}>
              <Button href="/spawn/1" type="primary">
                Run this agent
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
