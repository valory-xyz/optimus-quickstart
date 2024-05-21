import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Flex, Typography } from 'antd';
import { formatUnits } from 'ethers/lib/utils';
import { ReactNode, useEffect, useMemo } from 'react';

import { COLOR, SERVICE_TEMPLATES } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';
import { useStore } from '@/hooks/useStore';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

const serviceTemplate = SERVICE_TEMPLATES[0];

export const MainNeedsFunds = () => {
  const { storeState, storeIpc } = useStore();
  const { isBalanceLoaded, totalEthBalance, totalOlasBalance } = useBalance();

  const isInitialFunded = storeState?.isInitialFunded;

  const serviceFundRequirements = useMemo(() => {
    const monthlyGasEstimate = Number(
      formatUnits(`${serviceTemplate.configuration.monthly_gas_estimate}`, 18),
    );
    const olasCostOfBond = Number(
      formatUnits(`${serviceTemplate.configuration.olas_cost_of_bond}`, 18),
    );
    const olasRequiredToStake = Number(
      formatUnits(
        `${serviceTemplate.configuration.olas_required_to_stake}`,
        18,
      ),
    );
    return {
      eth: monthlyGasEstimate,
      olas: olasCostOfBond + olasRequiredToStake,
    };
  }, []);

  const hasEnoughEth = useMemo(
    () => (totalEthBalance || 0) >= (serviceFundRequirements?.eth || 0),
    [serviceFundRequirements?.eth, totalEthBalance],
  );

  const hasEnoughOlas = useMemo(
    () => (totalOlasBalance || 0) >= (serviceFundRequirements?.olas || 0),
    [serviceFundRequirements?.olas, totalOlasBalance],
  );

  const isVisible: boolean = useMemo(() => {
    if (isInitialFunded) return false;
    if (
      [totalEthBalance, totalOlasBalance].some(
        (balance) => balance === undefined,
      )
    )
      return false;
    if (hasEnoughEth && hasEnoughOlas) return false;
    return true;
  }, [
    hasEnoughEth,
    hasEnoughOlas,
    isInitialFunded,
    totalEthBalance,
    totalOlasBalance,
  ]);

  const message: ReactNode = useMemo(
    () => (
      <Flex vertical>
        <Text strong style={{ color: 'inherit' }}>
          Your agent needs funds
        </Text>
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

  useEffect(() => {
    if (hasEnoughEth && hasEnoughOlas && isInitialFunded === false) {
      storeIpc?.set('isInitialFunded', true);
    }
  }, [hasEnoughEth, hasEnoughOlas, isInitialFunded, storeIpc]);

  if (!isVisible) return null;
  if (!isBalanceLoaded) return null;

  return (
    <CardSection>
      <Alert
        className="card-section-alert"
        icon={
          <InfoCircleOutlined
            className="mb-auto"
            style={{ color: COLOR.PURPLE_DARK }}
          />
        }
        showIcon
        message={message}
        type="info"
      />
    </CardSection>
  );
};
