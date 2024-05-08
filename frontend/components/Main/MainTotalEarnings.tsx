import { Flex, Typography } from 'antd';

import { balanceFormat } from '@/common-util';

const earnings = undefined;
export const MainTotalEarnings = () => {
  return (
    <Flex justify="space-between">
      <Typography.Text type="secondary" strong>
        Total Earnings:{' '}
      </Typography.Text>
      <Typography.Text strong>
        {balanceFormat(earnings, 2)} OLAS
      </Typography.Text>
    </Flex>
  );
};
