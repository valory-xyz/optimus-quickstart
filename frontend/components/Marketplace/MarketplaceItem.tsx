import { Row, Col, Button } from "antd";

export const MarketplaceItem = () => {
  return (
    <Row style={{ borderBottom: "1px solid black" }} gutter={16}>
      <Col span={8}>
        <img
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
        <Button>Run this agent</Button>
      </Col>
    </Row>
  );
};
