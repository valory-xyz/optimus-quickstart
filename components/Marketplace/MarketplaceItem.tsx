import { Row, Col, Button } from "antd";
import Image from "next/image";
export const MarketplaceItem = () => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <Image
          src=""
          alt="Image"
          style={{
            minWidth: "100%",
            minHeight: "100%",
            border: "1px solid black",
          }}
        />
      </Col>
      <Col span={16}>
        <h2>Agent Name</h2>
        <p>Agent Description</p>
        <Button href="/spawn/1" type="primary">
          Run this agent
        </Button>
      </Col>
    </Row>
  );
};
