import { Flex, Typography } from 'antd';
import { formatUnits } from 'ethers/lib/utils';
import { ReactNode, useMemo } from 'react';

import { SERVICE_TEMPLATES } from '@/constants';
import { UNICODE_SYMBOLS } from '@/constants/unicode';
import { useBalance } from '@/hooks';

import { Alert } from '../common/Alert';
import { CardSection } from '../styled/CardSection';

const { Text, Paragraph } = Typography;
const COVER_PREV_BLOCK_BORDER_STYLE = { marginTop: '-1px' };

export const useNeedsFunds = () => {
  const serviceTemplate = SERVICE_TEMPLATES[0];
  const { totalEthBalance, totalOlasBalance } = useBalance();

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
  }, [
    serviceTemplate.configuration.monthly_gas_estimate,
    serviceTemplate.configuration.olas_cost_of_bond,
    serviceTemplate.configuration.olas_required_to_stake,
  ]);

  const hasEnoughEth = useMemo(
    () => (totalEthBalance || 0) >= (serviceFundRequirements?.eth || 0),
    [serviceFundRequirements?.eth, totalEthBalance],
  );

  const hasEnoughOlas = useMemo(
    () => (totalOlasBalance || 0) >= (serviceFundRequirements?.olas || 0),
    [serviceFundRequirements?.olas, totalOlasBalance],
  );

  return { hasEnoughEth, hasEnoughOlas, serviceFundRequirements };
};

export const MainNeedsFunds = () => {
  const { isBalanceLoaded, totalEthBalance, totalOlasBalance } = useBalance();
  const { hasEnoughEth, hasEnoughOlas, serviceFundRequirements } =
    useNeedsFunds();

  const isVisible: boolean = useMemo(() => {
    if (
      [totalEthBalance, totalOlasBalance].some(
        (balance) => balance === undefined,
      )
    ) {
      return false;
    }

    if (hasEnoughEth && hasEnoughOlas) return false;
    return true;
  }, [hasEnoughEth, hasEnoughOlas, totalEthBalance, totalOlasBalance]);

  const message: ReactNode = useMemo(
    () => (
      <Flex vertical gap={4}>
        <Text className="font-weight-600 mb-4">Your agent needs funds</Text>
        <Paragraph className="mb-4">
          USE THE ACCOUNT CREDENTIALS PROVIDED IN THE “ADD FUNDS” INSTRUCTIONS
          BELOW.
        </Paragraph>
        <Paragraph className="mb-4">
          To run your agent, you must add these amounts to your account:
        </Paragraph>
        {!hasEnoughOlas && (
          <Text>
            <span className="font-weight-600">{`${UNICODE_SYMBOLS.OLAS}${serviceFundRequirements.olas} OLAS `}</span>
            - for staking.
          </Text>
        )}
        {!hasEnoughEth && (
          <Text>
            <span className="font-weight-600">
              {`${serviceFundRequirements.eth} XDAI `}
            </span>
            - for gas & trading balance.
          </Text>
        )}
      </Flex>
    ),
    [serviceFundRequirements, hasEnoughEth, hasEnoughOlas],
  );

  if (!isVisible) return null;
  if (!isBalanceLoaded) return null;

  return (
    <CardSection style={COVER_PREV_BLOCK_BORDER_STYLE}>
      <Alert showIcon message={message} type="primary" fullWidth />
    </CardSection>
  );
};
