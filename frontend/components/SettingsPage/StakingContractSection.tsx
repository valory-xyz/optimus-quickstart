import { Button, Flex, Typography } from 'antd';

import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { Pages } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';
import { useStakingProgram } from '@/hooks/useStakingProgram';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

export const StakingContractSection = () => {
  const { goto } = usePageState();
  const { currentStakingProgram } = useStakingProgram();
  return (
    <CardSection vertical gap={8} align="start" borderbottom="true">
      <Text strong>Staking contract</Text>
      <Flex gap={16}>
        <Text type="secondary">{currentStakingProgram.name}</Text>
        <a
          href={`https://gnosisscan.io/address/${currentStakingProgram.contractAddress}`}
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
