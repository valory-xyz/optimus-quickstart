import { Col, Flex, Row, Skeleton, Tag, Typography } from 'antd';

import { balanceFormat } from '@/common-util';
import { useBalance } from '@/hooks';
import { useReward } from '@/hooks/useReward';

import { CardSection } from '../styled/CardSection';

const { Text } = Typography;

// TODO: Replace with real data
const isStakingInfoLoaded = false;
const isStaked = false;

export const MainRewards = () => {
  const { availableRewardsForEpochEther, isEligibleForRewards } = useReward();
  const { isBalanceLoaded, totalOlasStakedBalance } = useBalance();

  return (
    <CardSection gap={5} vertical>
      <Row justify="space-between">
        <Col span={12}>
          <Flex vertical gap={4} align="flex-start">
            <Text>Staking rewards today</Text>
            {isBalanceLoaded ? (
              <>
                <Text strong style={{ fontSize: 20 }}>
                  {balanceFormat(availableRewardsForEpochEther, 2)} OLAS
                </Text>
                {isEligibleForRewards ? (
                  <Tag color="success">Earned</Tag>
                ) : (
                  <Tag color="processing">Not yet earned</Tag>
                )}
              </>
            ) : (
              <Flex vertical gap={8}>
                <Skeleton.Button active size="small" style={{ width: 92 }} />
                <Skeleton.Button active size="small" style={{ width: 92 }} />
              </Flex>
            )}
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical gap={4} align="flex-start">
            <Text>Staked amount</Text>
            {isStakingInfoLoaded ? (
              <>
                <Text strong style={{ fontSize: 20 }}>
                  {balanceFormat(totalOlasStakedBalance, 2)} OLAS
                </Text>
                {isStaked ? null : <Tag color="processing">Not yet staked</Tag>}
              </>
            ) : (
              <Flex vertical gap={8}>
                <Skeleton.Button active size="small" style={{ width: 92 }} />
                <Skeleton.Button active size="small" style={{ width: 92 }} />
              </Flex>
            )}
          </Flex>
        </Col>
      </Row>
    </CardSection>
  );
};
