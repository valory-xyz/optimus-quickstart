import { BellOutlined, SettingOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

export const Navbar = () => {
  return (
    <Flex vertical={false} justify="space-between" style={{ minWidth: "100%" }}>
      <Typography.Text style={{ fontWeight: 700 }}>Operate</Typography.Text>
      <Flex gap={4}>
        <BellOutlined />
        <SettingOutlined />
      </Flex>
    </Flex>
  );
};
