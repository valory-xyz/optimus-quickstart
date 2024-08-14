import { Flex, Typography } from 'antd';

import { CustomAlert } from '@/components/Alert';
import { UNICODE_SYMBOLS } from '@/constants/symbols';

export const AlertInsufficientMigrationFunds = ({
  totalOlasBalance,
  totalEthBalance,
}: {
  totalOlasBalance: number;
  totalEthBalance: number;
}) => (
  <CustomAlert
    type="warning"
    fullWidth
    showIcon
    message={'Insufficient amount of funds to switch'}
    description={
      <Flex vertical gap={4}>
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
);
{
  /* No jobs available alert */
}

export const AlertNoSlots = () => (
  <CustomAlert
    type="warning"
    fullWidth
    showIcon
    message={
      <Typography.Text>
        No slots currently available - try again later.
      </Typography.Text>
    }
  />
);

export const AlertUpdateToMigrate = () => (
  <CustomAlert
    type="warning"
    fullWidth
    showIcon
    message={'App update required'}
    description={
      <Flex vertical gap={4}>
        {/* 
          TODO: Define version requirement in some JSON store?
          How do we access this date on a previous version? 
        */}
        <Typography.Text>
          This incentive program is available for users who have the app version
          rc105 or higher.
        </Typography.Text>
        {/* TODO: make current version accessible via Electron or Env? */}
        <Typography.Text>Current app version: rc97</Typography.Text>
        {/* TODO: trigger update through IPC */}
        <Typography.Link href="#">
          Update Pearl to the latest version {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Typography.Link>
      </Flex>
    }
  />
);

export const AlertCantMigrateDefault = () => (
  <CustomAlert
    type="warning"
    fullWidth
    showIcon
    message={'Unable to migrate.'}
  />
);
