import { Typography } from 'antd';

export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography.Text className="font-weight-600">{children}</Typography.Text>
);
