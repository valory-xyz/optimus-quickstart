import { MarketplaceItem } from "@/types/MarketplaceItem";
import { Row, Col, Button, Typography, Flex, Card } from "antd";
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
      <Row gutter={16}>
        <Col span={8}>
          <Image src={image_src} alt="Image" width={200} height={200} />
        </Col>
        <Col span={16}>
          <Flex vertical style={{ height: "100%" }}>
            <Typography.Title level={3}>{name}</Typography.Title>
            <Typography.Text>{description}</Typography.Text>
            <Flex style={{ marginTop: "auto" }}>
              <Button href="/spawn/1" type="primary">
                Run this agent
              </Button>
            </Flex>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};
