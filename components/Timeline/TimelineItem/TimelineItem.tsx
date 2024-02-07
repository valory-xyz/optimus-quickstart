import { Typography, Flex } from "antd";

export const TimelineItem = ({
  title,
  body,
}: {
  title: string;
  body: JSX.Element;
}) => {
  return (
    <Flex vertical gap={"small"}>
      <Typography.Title level={5}>{title}</Typography.Title>
      <div>{body}</div>
    </Flex>
  );
};
