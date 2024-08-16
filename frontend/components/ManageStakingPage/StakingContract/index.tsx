import { Button, Divider, Flex, theme, Typography } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';

import { CardSection } from '@/components/styled/CardSection';
import { STAKING_PROGRAM_META } from '@/constants/stakingProgramMeta';
import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { StakingProgram } from '@/enums/StakingProgram';
import { StakingProgramStatus } from '@/enums/StakingProgramStatus';
import { useBalance } from '@/hooks/useBalance';
import { useStakingContractInfo } from '@/hooks/useStakingContractInfo';
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
  const { activeStakingProgram, defaultStakingProgram } = useStakingProgram();
  const { stakingContractInfoRecord } = useStakingContractInfo();
  const { token } = useToken();
  const { totalOlasBalance, isBalanceLoaded } = useBalance();

  const stakingContractInfo = stakingContractInfoRecord?.[stakingProgram];

  const activeStakingProgramMeta = STAKING_PROGRAM_META[stakingProgram];

  const isSelected =
    activeStakingProgram && activeStakingProgram === stakingProgram;

  const hasEnoughOlas = useMemo(() => {
    if (totalOlasBalance === undefined) return false;
    if (!stakingContractInfo) return false;
    if (!stakingContractInfo.minStakingDeposit) return false;
    return totalOlasBalance > stakingContractInfo?.minStakingDeposit;
  }, [stakingContractInfo, totalOlasBalance]);

  const hasEnoughSlots =
    stakingContractInfo?.maxNumServices &&
    stakingContractInfo?.serviceIds &&
    stakingContractInfo?.maxNumServices >
      stakingContractInfo?.serviceIds?.length;

  // TODO: compatibility needs to be implemented
  const isAppVersionCompatible = true; // contract.appVersion === 'rc105';

  const isMigratable =
    !isSelected &&
    activeStakingProgram === StakingProgram.Alpha && // TODO: make more elegant
    isBalanceLoaded &&
    hasEnoughSlots &&
    hasEnoughOlas &&
    isAppVersionCompatible;

  const cantMigrateAlert = useMemo(() => {
    if (isSelected || !isBalanceLoaded) {
      return null;
    }

    if (!hasEnoughSlots) {
      return <AlertNoSlots />;
    }

    if (!hasEnoughOlas) {
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
    hasEnoughSlots,
    hasEnoughOlas,
    isAppVersionCompatible,
  ]);

  const contractTagStatus = useMemo(() => {
    if (activeStakingProgram === stakingProgram)
      return StakingProgramStatus.Selected;

    // Pearl is not staked, set as Selected if default (Beta)
    if (!activeStakingProgram && stakingProgram === defaultStakingProgram)
      return StakingProgramStatus.Selected;

    // Otherwise, highlight Beta as New
    if (stakingProgram === StakingProgram.Beta) return StakingProgramStatus.New;

    // Otherwise, no tag
    return;
  }, [activeStakingProgram, defaultStakingProgram, stakingProgram]);

  return (
    <CardSection
      style={
        isSelected || !activeStakingProgram
          ? { background: token.colorBgContainerDisabled }
          : {}
      }
      borderbottom="true"
      vertical
      gap={16}
    >
      {/* Title */}
      <Flex gap={12}>
        <Typography.Title
          level={5}
          className="m-0"
        >{`${activeStakingProgramMeta.name} contract`}</Typography.Title>
        {/* TODO: pass `status` attribute */}
        <StakingContractTag status={contractTagStatus} />
        {!isSelected && (
          // here instead of isSelected we should check that the contract is not the old staking contract
          // but the one from staking factory (if we want to open govern)
          <a
            href={`https://gnosisscan.io/address/${contractAddress}`}
            target="_blank"
            className="ml-auto"
          >
            Contract details {UNICODE_SYMBOLS.EXTERNAL_LINK}
          </a>
        )}
      </Flex>

      {/* TODO: fix */}

      {/* Contract details
      {stakingContractInfo?.availableRewards && (
        <ContractParameter
          label="Rewards per work period"
          value={`${stakingContractInfo?.availableRewards} OLAS`}
        />
      )}

      {stakingContractInfo?.minStakingDeposit && (
        <ContractParameter
          label="Required OLAS for staking"
          value={`${stakingContractInfo?.minStakingDeposit} OLAS`}
        />
      )} */}

      {cantMigrateAlert}
      {/* Switch to program button */}
      {!isSelected && (
        <Button type="primary" size="large" disabled={!isMigratable}>
          Switch to {activeStakingProgramMeta?.name} contract
        </Button>
      )}
    </CardSection>
  );
};
