import { Button, Flex, Typography } from 'antd';

import { UNICODE_SYMBOLS } from '@/constants/symbols';
import { Pages } from '@/enums/PageState';
import { usePageState } from '@/hooks/usePageState';
import { useStakingProgram } from '@/hooks/useStakingProgram';

import { CardSection } from '../styled/CardSection';

export const StakingContractSection = () => {
  const { goto } = usePageState();
  const { currentStakingProgram } = useStakingProgram();
  return (
    <CardSection borderbottom="true" vertical gap={8}>
      <Typography.Text strong>Staking contract</Typography.Text>
      <Flex gap={4}>
        <Typography.Text disabled>{currentStakingProgram.name}</Typography.Text>
        {/* TODO: Add explorer link */}
        <Typography.Link href="#">
          Contract details {UNICODE_SYMBOLS.EXTERNAL_LINK}
        </Typography.Link>
      </Flex>
      <Button type="default" onClick={() => goto(Pages.ManageStaking)}>
        Manage
      </Button>
    </CardSection>
  );
};
