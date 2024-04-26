import { QuestionCircleTwoTone } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';

import { balanceFormat } from '@/common-util/numberFormatters';
import { useWallet } from '@/hooks';

export const MainGasBalance = () => {
  const { totalEthBalance } = useWallet();
  return (
    <Typography.Text>
      Gas balance: {balanceFormat(totalEthBalance, 2)} XDAI&nbsp;
      <Tooltip title="Gas balance is the amount of XDAI you have to pay for transactions.">
        <QuestionCircleTwoTone />
      </Tooltip>
    </Typography.Text>
  );
};
