import { Button, Flex, theme, Typography } from 'antd';
import { useMemo } from 'react';

import { CardSection } from '@/components/styled/CardSection';
import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';
import { useBalance } from '@/hooks/useBalance';
import { Address } from '@/types/Address';
import { IncentiveProgram } from '@/types/IncentiveProgram';

import {
  AlertInsufficientMigrationFunds,
  AlertNoSlots,
  AlertUpdateToMigrate,
} from './alerts';
import { IncentiveProgramTag } from './IncentiveProgramBadge';

const { useToken } = theme;

const ProgramTitle = ({
  name,
  status,
}: {
  name: string;
  status: IncentiveProgramStatus;
}) => (
  <Flex gap={2}>
    <Typography.Title level={3}>{name}</Typography.Title>
    <IncentiveProgramTag programStatus={status} />
  </Flex>
);

const ProgramDetailsLink = ({ address }: { address: Address }) => {
  const blockExplorerLink = `https://blockExplorer.com/poa/xdai/address/${address}`;
  return (
    <Typography.Link href={blockExplorerLink}>
      Contract details {UNICODE_SYMBOLS.EXTERNAL_LINK}
    </Typography.Link>
  );
};

const HorizontalGreyLine = () => (
  <span
    style={{
      display: 'flex',
      flexDirection: 'row',
      alignSelf: 'center',
      height: 'calc(50% - 1px)',
      flexGrow: 1,
      borderTop: '1px solid #f0f0f0',
    }}
  />
);

export const IncentiveProgramSection = ({
  program,
}: {
  program: IncentiveProgram;
}) => {
  const { token } = useToken();
  const { totalOlasBalance, totalEthBalance, isBalanceLoaded } = useBalance();

  const isEnoughSlots = false; //program.slots > 0;
  const isEnoughOlas = false; // totalOlasBalance;
  const isEnoughEth = false; // totalEthBalance;
  const isAppVersionCompatible = false; // program.appVersion === 'rc105';

  const isMigratable =
    program.status !== IncentiveProgramStatus.Deprecated &&
    program.status !== IncentiveProgramStatus.Selected &&
    isBalanceLoaded &&
    isEnoughSlots &&
    isEnoughOlas &&
    isEnoughEth &&
    isAppVersionCompatible;

  const alertCantMigrate = useMemo(() => {
    if (
      program.status === IncentiveProgramStatus.Deprecated ||
      program.status === IncentiveProgramStatus.Selected
    ) {
      return;
    }

    if (!isBalanceLoaded) {
      return;
    }

    if (isEnoughSlots) {
      return <AlertNoSlots />;
    }

    if (!isEnoughOlas || !isEnoughEth) {
      return (
        <AlertInsufficientMigrationFunds
          totalEthBalance={totalEthBalance!}
          totalOlasBalance={totalOlasBalance!}
        />
      );
    }

    if (!isAppVersionCompatible) {
      return <AlertUpdateToMigrate />;
    }

    if (!isMigratable) {
      return;
    }
  }, [
    isAppVersionCompatible,
    isBalanceLoaded,
    isEnoughEth,
    isEnoughOlas,
    isEnoughSlots,
    isMigratable,
    program.status,
    totalEthBalance,
    totalOlasBalance,
  ]);

  return (
    <CardSection
      style={isMigratable ? { background: token.colorBgContainerDisabled } : {}}
    >
      {/* Title */}
      <Flex gap={2} justify="space-between">
        <ProgramTitle name={program.name} status={program.status} />
        <ProgramDetailsLink address={program.contractAddress} />
      </Flex>
      {/* Rewards per work period */}
      <Flex gap={2} justify="space-between">
        <Typography.Text>Rewards per work period</Typography.Text>
        <HorizontalGreyLine />
        <Typography.Text>{`0.25 OLAS`}</Typography.Text>
      </Flex>
      {/* Required Olas */}
      <Flex gap={2} justify="space-between">
        <Typography.Text>Required OLAS for staking</Typography.Text>
        <HorizontalGreyLine />
        <Typography.Text>{`20 OLAS`}</Typography.Text>
      </Flex>
      {/* "Can't migrate" Alert */}
      {alertCantMigrate}
      {/* Switch to program button */}
      <Button disabled={!isMigratable}>Switch to {program.name}</Button>
    </CardSection>
  );
};
