import { Button, Flex, Skeleton, Typography } from 'antd';

import { Chain } from '@/client';
import { SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT_ADDRESSES } from '@/constants/contractAddresses';
import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { Pages } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';
import { useStakingProgram } from '@/hooks/useStakingProgram';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

export const SettingsStakingContractSection = () => {
  const { goto } = usePageState();
  const {
    activeStakingProgram,
    activeStakingProgramMeta,
    defaultStakingProgram,
    isLoadedActiveStakingProgram,
  } = useStakingProgram();

  const stakingContractAddress =
    SERVICE_STAKING_TOKEN_MECH_USAGE_CONTRACT_ADDRESSES[Chain.GNOSIS][
      activeStakingProgram ?? defaultStakingProgram
    ];

  if (!isLoadedActiveStakingProgram) {
    return <Skeleton style={{ height: 100 }} />;
  }

  return (
    <CardSection vertical gap={8} align="start" borderbottom="true">
      <Text strong>Staking contract</Text>
      <Flex gap={16}>
        <Text type="secondary">
          {activeStakingProgramMeta
            ? activeStakingProgramMeta.name
            : 'Not staked'}
        </Text>
        <a
          href={`https://gnosisscan.io/address/${stakingContractAddress}`}
          target="_blank"
        >
          Contract details {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </a>
      </Flex>
      <Button
        type="primary"
        ghost
        size="large"
        onClick={() => goto(Pages.ManageStaking)}
      >
        Manage
      </Button>
    </CardSection>
  );
};
