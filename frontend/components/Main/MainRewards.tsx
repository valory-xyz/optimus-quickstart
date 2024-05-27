import { Button, Col, Flex, Modal, Row, Skeleton, Tag, Typography } from 'antd';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { balanceFormat } from '@/common-util';
import { COLOR } from '@/constants';
import { useBalance } from '@/hooks';
import { useElectronApi } from '@/hooks/useElectronApi';
import { useReward } from '@/hooks/useReward';
import { useStore } from '@/hooks/useStore';

import { ConfettiAnimation } from '../common/ConfettiAnimation';

const { Text, Title } = Typography;

const RewardsRow = styled(Row)`
  margin: 0 -24px;
  > .ant-col {
    padding: 24px;

    &:not(:last-child) {
      border-right: 1px solid ${COLOR.BORDER_GRAY};
    }
  }
`;

const DisplayRewards = () => {
  const { availableRewardsForEpochEth, isEligibleForRewards } = useReward();
  const { isBalanceLoaded, totalOlasStakedBalance } = useBalance();

  // 20 OLAS is the minimum amount to stake
  const isStaked = totalOlasStakedBalance === 20;

  return (
    <RewardsRow>
      <Col span={12}>
        <Flex vertical gap={4} align="flex-start">
          <Text type="secondary">Staking rewards today</Text>
          {isBalanceLoaded ? (
            <>
              <Text strong style={{ fontSize: 20 }}>
                {balanceFormat(availableRewardsForEpochEth, 2)} OLAS
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
          <Text type="secondary">Staked amount</Text>
          {isBalanceLoaded ? (
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

// const REWARD_IMAGE =
// ('https://olas.network/_next/image?url=%2Fimages%2Fservices%2Fai-mechs%2Fintegrate-mechs.png&w=828&q=75');

const NotifyRewards = () => {
  const { isEligibleForRewards, availableRewardsForEpochEth } = useReward();
  const { totalOlasBalance } = useBalance();
  const { showNotification, store } = useElectronApi();
  const { storeState } = useStore();

  const [canShowNotification, setCanShowNotification] = useState(false);

  // hook to set the flag to show the notification
  useEffect(() => {
    if (!isEligibleForRewards) return;
    if (!storeState) return;
    if (storeState?.firstRewardNotificationShown) return;
    if (!availableRewardsForEpochEth) return;

    setCanShowNotification(true);
  }, [
    isEligibleForRewards,
    availableRewardsForEpochEth,
    showNotification,
    storeState,
  ]);

  // hook to show desktop app notification
  useEffect(() => {
    if (!canShowNotification) return;

    showNotification?.(
      'Your agent earned its first staking rewards!',
      `Congratulations! Your agent just got the first reward for you! Your current balance: ${availableRewardsForEpochEth} OLAS`,
    );
  }, [canShowNotification, availableRewardsForEpochEth, showNotification]);

  const closeNotificationModal = useCallback(() => {
    setCanShowNotification(false);

    // once the notification is closed, set the flag to true
    store?.set?.('firstRewardNotificationShown', true);
  }, [store]);

  const onTwitterShare = useCallback(() => {
    const shareText = `I just earned my first reward through the Operate app powered by #olas!\n\n\nDownload the Pearl app:`;
    const url = 'https://olas.network/operate'; // Replace with your URL
    const encodedText = encodeURIComponent(shareText);
    const encodedURL = encodeURIComponent(url);

    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedURL}`,
      '_blank',
    );
  }, []);

  if (!canShowNotification) return null;

  return (
    <Modal
      open={canShowNotification}
      width={400}
      onCancel={closeNotificationModal}
      footer={[
        <Button
          key="back"
          type="primary"
          block
          size="large"
          className="mt-8"
          onClick={onTwitterShare}
        >
          <Flex align="center" justify="center" gap={2}>
            Share on
            <Image
              src="/twitter.svg"
              width={24}
              height={24}
              alt="Share on twitter"
            />
          </Flex>
        </Button>,
      ]}
    >
      <ConfettiAnimation />

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
            {` ${balanceFormat(availableRewardsForEpochEth, 2)} OLAS `}
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
