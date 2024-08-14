import { Flex, Typography } from 'antd';
import { formatUnits } from 'ethers/lib/utils';
import { ReactNode, useEffect, useMemo } from 'react';

import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { useBalance } from '@/hooks/useBalance';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { useStore } from '@/hooks/useStore';
import { getMinimumStakedAmountRequired } from '@/utils/service';

import { CustomAlert } from '../../Alert';
import { AlertTitle } from '../../Alert/AlertTitle';
import { CardSection } from '../../styled/CardSection';

const { Text, Paragraph } = Typography;
const COVER_PREV_BLOCK_BORDER_STYLE = { marginTop: '-1px' };

const useNeedsFunds = () => {
  const { getServiceTemplates } = useServiceTemplates();

  const serviceTemplate = useMemo(
    () => getServiceTemplates()[0],
    [getServiceTemplates],
  );

  const { storeState } = useStore();
  const { safeBalance, totalOlasStakedBalance } = useBalance();

  const isInitialFunded = storeState?.isInitialFunded;

  const serviceFundRequirements = useMemo(() => {
    const monthlyGasEstimate = Number(
      formatUnits(`${serviceTemplate.configuration.monthly_gas_estimate}`, 18),
    );

    const minimumStakedAmountRequired =
      getMinimumStakedAmountRequired(serviceTemplate);

    return {
      eth: monthlyGasEstimate,
      olas: minimumStakedAmountRequired,
    };
  }, [serviceTemplate]);

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
        <AlertTitle>Your agent needs funds</AlertTitle>
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
      <CustomAlert showIcon message={message} type="primary" fullWidth />
    </CardSection>
  );
};
