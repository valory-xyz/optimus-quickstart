import { Flex, Typography } from 'antd';
import { formatUnits } from 'ethers/lib/utils';
import { ReactNode, useEffect, useMemo } from 'react';

import { SERVICE_TEMPLATES } from '@/constants/serviceTemplates';
import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { useBalance } from '@/hooks/useBalance';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useStore } from '@/hooks/useStore';

import { Alert } from '../Alert';
import { CardSection } from '../styled/CardSection';

const { Text, Paragraph } = Typography;
const COVER_PREV_BLOCK_BORDER_STYLE = { marginTop: '-1px' };

const useNeedsFunds = () => {
  const serviceTemplate = SERVICE_TEMPLATES[0];
  const { storeState } = useStore();
  const { safeBalance, totalOlasStakedBalance } = useBalance();

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
  }, [
    serviceTemplate.configuration.monthly_gas_estimate,
    serviceTemplate.configuration.olas_cost_of_bond,
    serviceTemplate.configuration.olas_required_to_stake,
  ]);

  const hasEnoughEthForInitialFunding = useMemo(
    () => (safeBalance?.ETH || 0) >= (serviceFundRequirements?.eth || 0),
    [serviceFundRequirements?.eth, safeBalance],
  );

  const hasEnoughOlasForInitialFunding = useMemo(() => {
    const olasInSafe = safeBalance?.OLAS || 0;
    const olasStakedBySafe = totalOlasStakedBalance || 0;

    const olasInSafeAndStaked = olasInSafe + olasStakedBySafe;

    return olasInSafeAndStaked >= serviceFundRequirements.olas;
  }, [
    safeBalance?.OLAS,
    totalOlasStakedBalance,
    serviceFundRequirements?.olas,
  ]);

  return {
    hasEnoughEthForInitialFunding,
    hasEnoughOlasForInitialFunding,
    serviceFundRequirements,
    isInitialFunded,
  };
};

export const MainNeedsFunds = () => {
  const { isBalanceLoaded } = useBalance();
  const {
    hasEnoughEthForInitialFunding,
    hasEnoughOlasForInitialFunding,
    serviceFundRequirements,
    isInitialFunded,
  } = useNeedsFunds();

  const electronApi = useElectronApi();

  const isVisible: boolean = useMemo(() => {
    if (isInitialFunded) return false;
    if (!isBalanceLoaded) return false;
    if (hasEnoughEthForInitialFunding && hasEnoughOlasForInitialFunding)
      return false;
    return true;
  }, [
    hasEnoughEthForInitialFunding,
    hasEnoughOlasForInitialFunding,
    isBalanceLoaded,
    isInitialFunded,
  ]);

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
        {!hasEnoughOlasForInitialFunding && (
          <Text>
            <span className="font-weight-600">{`${UNICODE_SYMBOLS.OLAS}${serviceFundRequirements.olas} OLAS `}</span>
            - for staking.
          </Text>
        )}
        {!hasEnoughEthForInitialFunding && (
          <Text>
            <span className="font-weight-600">
              {`${serviceFundRequirements.eth} XDAI `}
            </span>
            - for trading balance.
          </Text>
        )}
      </Flex>
    ),
    [
      serviceFundRequirements,
      hasEnoughEthForInitialFunding,
      hasEnoughOlasForInitialFunding,
    ],
  );

  useEffect(() => {
    if (
      hasEnoughEthForInitialFunding &&
      hasEnoughOlasForInitialFunding &&
      !isInitialFunded
    ) {
      electronApi.store?.set?.('isInitialFunded', true);
    }
  }, [
    electronApi.store,
    hasEnoughEthForInitialFunding,
    hasEnoughOlasForInitialFunding,
    isInitialFunded,
  ]);

  if (!isVisible) return null;

  return (
    <CardSection style={COVER_PREV_BLOCK_BORDER_STYLE}>
      <Alert showIcon message={message} type="primary" fullWidth />
    </CardSection>
  );
};
