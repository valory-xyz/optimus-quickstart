import { Button, Flex, Typography } from 'antd';
import { useRouter } from 'next/router';

type SpawnErrorProps = {
  message: string;
};

export const SpawnError = ({ message }: SpawnErrorProps) => {
  const router = useRouter();
  return (
    <Flex vertical justify="center" align="center">
      <Typography.Text>{message}</Typography.Text>
      <Button type="primary" onClick={() => router.push('/')}>
        Back to Home
      </Button>
    </Flex>
  );
};
