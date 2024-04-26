import { Alert, Flex } from 'antd';
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

  const differenceFundRequirements = useMemo(() => {
    return {
      eth: serviceFundRequirements.eth - (totalEthBalance ?? 0),
      olas: serviceFundRequirements.olas - (totalOlasBalance ?? 0),
    };
  }, [
    serviceFundRequirements.eth,
    serviceFundRequirements.olas,
    totalEthBalance,
    totalOlasBalance,
  ]);

  const isVisible: boolean = useMemo(() => {
    if (
      [totalEthBalance, totalOlasBalance].some(
        (balance) => balance === undefined,
      )
    )
      return false;
    if (serviceFundRequirements.eth < totalEthBalance!) return false;
    if (serviceFundRequirements.olas < totalOlasBalance!) return false;
    return true;
  }, [
    serviceFundRequirements.eth,
    serviceFundRequirements.olas,
    totalEthBalance,
    totalOlasBalance,
  ]);

  const message: ReactNode = useMemo(
    () => (
      <Flex vertical>
        <strong>Your agent needs funds</strong>
        <span>To run your agent, add at least: </span>
        <ul>
          {differenceFundRequirements.olas &&
            differenceFundRequirements.olas >= 0 && (
              <li>
                {UNICODE_SYMBOLS.OLAS} {differenceFundRequirements.olas}
              </li>
            )}
          {differenceFundRequirements.eth &&
            differenceFundRequirements.eth >= 0 && (
              <li>{differenceFundRequirements.eth}</li>
            )}
        </ul>
      </Flex>
    ),
    [differenceFundRequirements.eth, differenceFundRequirements.olas],
  );

  return isVisible ? (
    <Alert
      message={message}
      style={{ fontSize: 'medium', marginTop: 20 }}
      type="info"
    />
  ) : null;
};
