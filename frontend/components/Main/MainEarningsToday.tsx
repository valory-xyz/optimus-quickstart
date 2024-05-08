import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, ColProps, Flex, Row, Typography } from 'antd';
import styled from 'styled-components';

export const MainEarningsToday = () => {
  return (
    <Flex vertical>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Rewards
      </Typography.Title>
      <Row>
        <FlexCol span={12}>
          <Flex gap={5}>
            <Typography.Text>Today </Typography.Text>
            <InfoCircleOutlined color="secondary" />
          </Flex>
          <Typography.Text strong>0 / 0.5 OLAS</Typography.Text>
        </FlexCol>
        <FlexCol span={12}>
          <Typography.Text>All time</Typography.Text>
          <Typography.Text strong>0 OLAS</Typography.Text>
        </FlexCol>
      </Row>
    </Flex>
  );
};

const FlexCol = styled(Col)<ColProps>`
  display: flex;
  flex-direction: column;
`;
