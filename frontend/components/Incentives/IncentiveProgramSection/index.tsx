import { Button, Flex, Typography } from 'antd';

import { Alert } from '@/components/Alert';
import { AlertTitle } from '@/components/Alert/AlertTitle';
import { CardSection } from '@/components/styled/CardSection';
import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { IncentiveProgramStatus } from '@/enums/IcentiveProgram';
import { useBalance } from '@/hooks/useBalance';
import { Address } from '@/types/Address';
import { IncentiveProgram } from '@/types/IncentiveProgram';

import { IncentiveProgramTag } from './IncentiveProgramBadge';

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
  const { totalOlasBalance, totalEthBalance } = useBalance();
  return (
    <CardSection>
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
        <Typography.Text>{`0.25 OLAS`}</Typography.Text>
      </Flex>
      {/* Funding alert */}
      <Alert
        type="warning"
        fullWidth
        showIcon
        message={
          <Flex vertical gap={4}>
            <AlertTitle>Insufficient amount of funds to switch</AlertTitle>
            <Typography.Text>
              Add funds to your account to meet the program requirements.
            </Typography.Text>
            <Typography.Text>
              Your current OLAS balance: {totalOlasBalance} OLAS
            </Typography.Text>
            <Typography.Text>
              Your current trading balance: {totalEthBalance} XDAI
            </Typography.Text>
          </Flex>
        }
      />
      {/* No jobs available alert */}
      <Alert
        type="warning"
        fullWidth
        showIcon
        message={
          <Flex vertical gap={4}>
            <Typography.Text>
              No jobs currently available – try again later.
            </Typography.Text>
          </Flex>
        }
      />
      {/* App update required */}
      <Alert
        type="warning"
        fullWidth
        showIcon
        message={
          <Flex vertical gap={4}>
            <AlertTitle>App update required</AlertTitle>
            <Typography.Text>
              This incentive program is available for users who have the app
              version rc105 or higher.
            </Typography.Text>
            <Typography.Text>Current app version: rc97</Typography.Text>
            {/* TODO: trigger update through IPC */}
            <Typography.Link href="#">
              Update Pearl to the latest version {UNICODE_SYMBOLS.EXTERNAL_LINK}
            </Typography.Link>
          </Flex>
        }
      />
      {/* Switch to program button */}
      <Button disabled>Switch to {program.name}</Button>
    </CardSection>
  );
};
