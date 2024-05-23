import { Button, Col, Flex, Modal, Row, Skeleton, Tag, Typography } from 'antd';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { balanceFormat } from '@/common-util';
import { COLOR } from '@/constants';
import { useBalance } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useReward } from '@/hooks/useReward';

import { Confetti } from '../../common-util/Confetti';

const { Text, Title } = Typography;

const RewardsRow = styled(Row)`
  margin: 0 -24px;
  > .ant-col {
    padding: 24px;
    border-right: 1px solid ${COLOR.BORDER_GRAY};
  }
`;

// TODO: Replace with real data
const isStakingInfoLoaded = false;
const isStaked = false;

const DisplayRewards = () => {
  const { availableRewardsForEpochEther, isEligibleForRewards } = useReward();
  const { isBalanceLoaded, totalOlasStakedBalance } = useBalance();

  return (
    <RewardsRow>
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
    </RewardsRow>
  );
};

const NotifyRewards = () => {
  const { isEligibleForRewards, availableRewardsForEpochEther } = useReward();
  const { totalOlasBalance } = useBalance();
  const { showNotification } = useElectronApi();

  const [canShowNotification, setCanShowNotification] = useState(true);

  useEffect(() => {
    // const hasAlreadyNotified = false; // TODO: Implement this once state persistence is available
    // if (!isEligibleForRewards) return;
    // if (hasAlreadyNotified) return;
    // setCanShowNotification(
    //   isEligibleForRewards && !!availableRewardsForEpochEther,
    // );
  }, [isEligibleForRewards, availableRewardsForEpochEther, showNotification]);

  useEffect(() => {
    if (!canShowNotification) return;

    showNotification?.(
      'Your agent earned its first staking rewards!',
      `Congratulations! Your agent just got the first reward for you! Your current balance: ${availableRewardsForEpochEther} OLAS`,
    );

    // TODO: add setter for hasAlreadyNotified
  }, [canShowNotification, availableRewardsForEpochEther, showNotification]);

  if (!canShowNotification) return null;

  return (
    <Modal
      open={canShowNotification}
      width={400}
      onCancel={() => setCanShowNotification(false)}
      footer={[
        <Button
          key="back"
          // disabled
          type="primary"
          block
          size="large"
          style={{ marginTop: 16 }}
        >
          <Flex align="center" justify="center" gap={2}>
            Share on
            <Image src="/twitter.svg" width={24} height={24} alt="OLAS logo" />
          </Flex>
        </Button>,
      ]}
    >
      <Confetti />

      <Flex align="center" justify="center">
        <Image
          src="/splash-robot-head.png"
          width={100}
          height={100}
          alt="OLAS logo"
        />
      </Flex>

      <Title level={5} className="mt-12">
        Your agent just earned the first reward!
      </Title>

      <Flex vertical gap={16}>
        <Text>
          Congratulations! Your agent just earned the first
          <Text strong>
            {` ${balanceFormat(availableRewardsForEpochEther, 2)} OLAS `}
          </Text>
          for you!
        </Text>

        <Text>
          Your current balance:
          <Text strong>{` ${balanceFormat(totalOlasBalance, 2)} OLAS `}</Text>
        </Text>

        <Text>Keep it running to get even more!</Text>
      </Flex>
    </Modal>
  );
};

export const MainRewards = () => (
  <>
    <DisplayRewards />
    <NotifyRewards />
  </>
);

/**
 * animation
 * - https://lottiefiles.com/animations/success-icon-iY8xKnizbH
 * - https://www.npmjs.com/package/react-confetti-explosion
 * - https://fireworks.js.org/
 * - https://www.codewithrandom.com/2023/11/21/confetti-effects-using-css/
 */
