import { QuestionCircleTwoTone } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';

import { balanceFormat } from '@/common-util/numberFormatters';
import { useBalance } from '@/hooks';

import { CardSection } from '../styled/CardSection';

export const MainGasBalance = () => {
  const { totalEthBalance } = useBalance();
  return (
    <CardSection justify="space-between" border>
      <Typography.Text type="secondary" strong>
        Gas and trading balance&nbsp;
        <Tooltip title="Gas balance is the amount of XDAI you have to pay for transactions.">
          <QuestionCircleTwoTone />
        </Tooltip>
      </Typography.Text>
      <Typography.Text strong>
        {balanceFormat(totalEthBalance, 2)} XDAI&nbsp;
      </Typography.Text>
    </CardSection>
  );
};
