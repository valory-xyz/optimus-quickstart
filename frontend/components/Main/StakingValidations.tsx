import { Flex, Typography } from 'antd';
import { useEffect } from 'react';

import { Alert } from '../common/Alert';
import { useStakingContractInfo } from '../store/stackingContractInfo';
import { CardSection } from '../styled/CardSection';

const { Text, Paragraph } = Typography;

const COVER_PREV_BLOCK_BORDER_STYLE = { marginBottom: '-1px' };

export const StakingValidations = () => {
  const {
    hasEnoughServiceSlots,
    isRewardsAvailable,
    isStakingContractInfoLoading,
    fetchStakingContractInfo,
  } = useStakingContractInfo();

  useEffect(() => {
    fetchStakingContractInfo();
  }, [fetchStakingContractInfo]);

  if (isStakingContractInfoLoading) return null;

  if (!isRewardsAvailable) {
    return (
      <CardSection style={COVER_PREV_BLOCK_BORDER_STYLE}>
        <Alert
          showIcon
          message={
            <Flex vertical gap={4}>
              <Text className="font-weight-600 mb-4">No rewards available</Text>
              <Paragraph className="mb-4">
                There are no rewards available for staking.
              </Paragraph>
            </Flex>
          }
          type="error"
          fullWidth
        />
      </CardSection>
    );
  }

  if (!hasEnoughServiceSlots) {
    return (
      <CardSection style={COVER_PREV_BLOCK_BORDER_STYLE}>
        <Alert
          showIcon
          message={
            <Flex vertical gap={4}>
              <Text className="font-weight-600 mb-4">
                Not enough service slots
              </Text>
              <Paragraph className="mb-4">
                You have reached the maximum number of services allowed for
                staking.
              </Paragraph>
            </Flex>
          }
          type="error"
          fullWidth
        />
      </CardSection>
    );
  }

  return null;
};
