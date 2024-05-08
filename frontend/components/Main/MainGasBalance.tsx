import { QuestionCircleTwoTone } from '@ant-design/icons';
import { Flex, Tooltip, Typography } from 'antd';

import { balanceFormat } from '@/common-util/numberFormatters';
import { useBalance } from '@/hooks';

export const MainGasBalance = () => {
  const { totalEthBalance } = useBalance();
  return (
    <Flex justify="space-between">
      <Typography.Text type="secondary" strong>
        Gas balance:{' '}
        <Tooltip title="Gas balance is the amount of XDAI you have to pay for transactions.">
          <QuestionCircleTwoTone />
        </Tooltip>
      </Typography.Text>
      <Typography.Text strong>
        {balanceFormat(totalEthBalance, 2)} XDAI&nbsp;
      </Typography.Text>
    </Flex>
  );
};
