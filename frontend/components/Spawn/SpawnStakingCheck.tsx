import { Service } from '@/client';
import { TOKENS } from '@/constants';
import { SpawnScreen } from '@/enums';
import { useAppInfo, useSpawn } from '@/hooks';
import EthersService from '@/service/Ethers';
import { Button, Flex, Skeleton, Typography, message } from 'antd';
import { ethers } from 'ethers';
import { useCallback, useMemo, useState } from 'react';

enum ButtonOptions {
  YES,
  NO,
}

type SpawnStakingCheckProps = {
  nextPage: SpawnScreen;
};

export const SpawnStakingCheck = ({ nextPage }: SpawnStakingCheckProps) => {
  const {
    spawnData: { rpc, serviceTemplate },
    setSpawnData,
    createService,
  } = useSpawn();
  const { userPublicKey } = useAppInfo();

  const [isCreating, setIsCreating] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<ButtonOptions>();

  /**
   * Creates service, then performs relevant state updates
   */
  const create = useCallback(
    async ({ isStaking }: { isStaking: boolean }) => {
      if (isCreating) {
        message.error('Service creation already in progress');
        return;
      }

      setIsCreating(true);

      try {
        const service: Service | undefined = await createService(isStaking);
        if (!service) throw new Error('Failed to create service');
      } catch (e) {
        message.error('Failed to create service');
      } finally {
        setIsCreating(false);
      }
    },
    [createService, isCreating],
  );

  /**
   * Checks if the user has the required OLAS to stake
   */
  const preflightStakingCheck = useCallback(async (): Promise<boolean> => {
    if (!userPublicKey) {
      return Promise.reject('No public key found');
    }
    if (!serviceTemplate?.configuration)
      return Promise.reject('No service template configuration');

    return EthersService.getErc20Balance(userPublicKey, rpc, TOKENS.gnosis.OLAS)
      .then((olasBalance: number) => {
        const { olas_required_to_stake, olas_cost_of_bond } =
          serviceTemplate.configuration;
        try {
          const currentBalance = Number(
            ethers.utils.parseUnits(`${olasBalance}`),
          );

          const hasBalance =
            currentBalance >= olas_required_to_stake + olas_cost_of_bond;

          return Promise.resolve(hasBalance);
        } catch (e) {
          return Promise.reject('Failed to calculate if user has balance');
        }
      })
      .catch((e: string) => {
        return Promise.reject(e);
      });
  }, [userPublicKey, rpc, serviceTemplate?.configuration]);

  const handleYes = async () => {
    setButtonClicked(ButtonOptions.YES);

    const isStaking = true;

    const canStake: boolean = await preflightStakingCheck().catch((e) => {
      message.error(e);
      return false;
    });

    if (!canStake) {
      message.error(`${userPublicKey} requires more OLAS to stake`);
      return setButtonClicked(undefined);
    }

    create({ isStaking })
      .then(() => {
        message.success('Service created successfully');
        setSpawnData((prev) => ({
          ...prev,
          isStaking,
          screen: nextPage,
        }));
      })
      .catch(() => setButtonClicked(undefined));
  };

  const handleNo = async () => {
    setButtonClicked(ButtonOptions.NO);

    const isStaking = false;

    create({ isStaking })
      .then(() => {
        message.success('Service created successfully');
        setSpawnData((prev) => ({
          ...prev,
          isStaking,
          screen: nextPage,
        }));
      })
      .catch(() => setButtonClicked(undefined));
  };

  const stakingRequirement: string | undefined = useMemo(() => {
    if (!serviceTemplate?.configuration) return undefined;
    const { olas_required_to_stake, olas_cost_of_bond } =
      serviceTemplate.configuration;
    return ethers.utils.formatUnits(
      `${olas_required_to_stake + olas_cost_of_bond}`,
    );
  }, [serviceTemplate?.configuration]);

  return (
    <Flex gap={8} vertical>
      <Flex vertical justify="center" align="center">
        <Typography.Text strong>Would you like to stake OLAS?</Typography.Text>
        <Typography.Text type="secondary">
          {stakingRequirement ? stakingRequirement : <Skeleton />} OLAS required
        </Typography.Text>
      </Flex>
      <Flex gap={8} justify="center">
        <Button
          type="primary"
          onClick={handleYes}
          disabled={isCreating}
          loading={buttonClicked === ButtonOptions.YES}
        >
          Yes
        </Button>
        <Button
          onClick={handleNo}
          disabled={isCreating}
          loading={buttonClicked === ButtonOptions.NO}
        >
          No
        </Button>
      </Flex>
    </Flex>
  );
};
