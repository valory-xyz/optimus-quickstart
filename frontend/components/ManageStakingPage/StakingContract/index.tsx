import { Button, Divider, Flex, theme, Typography } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';

import { CardSection } from '@/components/styled/CardSection';
import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { StakingProgram } from '@/enums/StakingProgram';
import { useBalance } from '@/hooks/useBalance';
import { useStakingProgram } from '@/hooks/useStakingProgram';
import { Address } from '@/types/Address';

import {
  AlertInsufficientMigrationFunds,
  AlertNoSlots,
  AlertUpdateToMigrate,
} from './alerts';
import { StakingContractTag } from './StakingContractTag';

const { Text } = Typography;

const { useToken } = theme;

const CustomDivider = styled(Divider)`
  flex: auto;
  width: max-content;
  min-width: 0;
  margin: 0;
`;

const ContractParameter = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Flex gap={16} align="center">
    <Text type="secondary">{label}</Text>
    <CustomDivider />
    <Text className="font-weight-600">{value}</Text>
  </Flex>
);

export const StakingContractSection = ({
  stakingProgram,
  contractAddress,
}: {
  stakingProgram: StakingProgram;
  contractAddress: Address;
}) => {
  const { currentStakingProgram } = useStakingProgram();

  const { token } = useToken();
  const { totalOlasBalance, isBalanceLoaded } = useBalance();

  const isSelected =
    currentStakingProgram && currentStakingProgram === stakingProgram;

  const stakingContractInfo = useMemo(() => {}, []);

  const isEnoughOlas = useMemo(() => {
    if (totalOlasBalance === undefined) return false;
    return totalOlasBalance > contract.requiredOlasForStaking;
  }, [totalOlasBalance, contract.requiredOlasForStaking]);
  const isAppVersionCompatible = true; // contract.appVersion === 'rc105';

  const isMigratable =
    !isSelected &&
    isBalanceLoaded &&
    contract.isEnoughSlots &&
    isEnoughOlas &&
    isAppVersionCompatible;

  const cantMigrateAlert = useMemo(() => {
    if (isSelected || !isBalanceLoaded) {
      return null;
    }

    if (!contract.isEnoughSlots) {
      return <AlertNoSlots />;
    }

    if (!isEnoughOlas) {
      return (
        <AlertInsufficientMigrationFunds totalOlasBalance={totalOlasBalance!} />
      );
    }

    if (!isAppVersionCompatible) {
      return <AlertUpdateToMigrate />;
    }
  }, [
    isSelected,
    isBalanceLoaded,
    totalOlasBalance,
    contract.isEnoughSlots,
    isEnoughOlas,
    isAppVersionCompatible,
  ]);

  return (
    <CardSection
      style={isSelected ? { background: token.colorBgContainerDisabled } : {}}
      borderbottom="true"
      vertical
      gap={16}
    >
      {/* Title */}
      <Flex gap={12}>
        <Typography.Title
          level={5}
          className="m-0"
        >{`${contract.name} contract`}</Typography.Title>
        <StakingContractTag status={contract.status} />
        {!isSelected && (
          // here instead of isSelected we should check that the contract is not the old staking contract
          // but the one from staking factory (if we want to open govern)
          <a
            href={`https://gnosisscan.io/address/${contract.contractAddress}`}
            target="_blank"
            className="ml-auto"
          >
            Contract details {UNICODE_SYMBOLS.EXTERNAL_LINK}
          </a>
        )}
      </Flex>
      {/* Contract details */}
      <ContractParameter
        label="Rewards per work period"
        value={`${contract.rewardsPerWorkPeriod} OLAS`}
      />
      <ContractParameter
        label="Required OLAS for staking"
        value={`${contract.requiredOlasForStaking} OLAS`}
      />
      {/* "Can't migrate" Alert */}
      {cantMigrateAlert}
      {/* Switch to program button */}
      {!isSelected && (
        <Button type="primary" size="large" disabled={!isMigratable}>
          Switch to {contract.name} contract
        </Button>
      )}
    </CardSection>
  );
};
