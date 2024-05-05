import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Flex, Typography } from 'antd';
import { formatUnits } from 'ethers/lib/utils';
import { ReactNode, useMemo } from 'react';

import { SERVICE_TEMPLATES } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useWallet } from '@/hooks';

export const MainNeedsFunds = () => {
  const serviceTemplate = SERVICE_TEMPLATES[0];
  const { totalEthBalance, totalOlasBalance } = useWallet();

  const serviceFundRequirements = useMemo(() => {
    return {
      eth: Number(
        formatUnits(
          `${serviceTemplate.configuration.monthly_gas_estimate}`,
          18,
        ),
      ),
      olas: Number(
        formatUnits(`${serviceTemplate.configuration.olas_cost_of_bond}`, 18),
      ),
    };
  }, [
    serviceTemplate.configuration.monthly_gas_estimate,
    serviceTemplate.configuration.olas_cost_of_bond,
  ]);

  const hasEnoughEth = useMemo(
    () => serviceFundRequirements?.eth < 0,
    [serviceFundRequirements.eth],
  );

  const hasEnoughOlas = useMemo(
    () => serviceFundRequirements?.olas < 0,
    [serviceFundRequirements.olas],
  );

  const isVisible: boolean = useMemo(() => {
    if (
      [totalEthBalance, totalOlasBalance].some(
        (balance) => balance === undefined,
      )
    )
      return false;
    if (hasEnoughEth && hasEnoughOlas) return false;
    return true;
  }, [hasEnoughEth, hasEnoughOlas, totalEthBalance, totalOlasBalance]);

  const message: ReactNode = useMemo(
    () => (
      <Flex vertical>
        <Typography.Text strong>Your agent needs funds</Typography.Text>
        <small>
          To run your agent, you must have at least these amounts in your
          account:
        </small>
        <ul className="alert-list text-sm">
          {!hasEnoughOlas && (
            <li>
              {UNICODE_SYMBOLS.OLAS}
              {serviceFundRequirements.olas} OLAS
            </li>
          )}
          {!hasEnoughEth && <li>${serviceFundRequirements.eth} XDAI</li>}
        </ul>
      </Flex>
    ),
    [serviceFundRequirements, hasEnoughEth, hasEnoughOlas],
  );

  return isVisible ? (
    <Alert
      icon={<InfoCircleOutlined className="mb-auto" />}
      showIcon
      message={message}
      type="info"
    />
  ) : null;
};
