import { Button, Flex, Typography } from 'antd';
import { useRouter } from 'next/router';

export const SpawnError = ({ message }: { message: string }) => {
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
