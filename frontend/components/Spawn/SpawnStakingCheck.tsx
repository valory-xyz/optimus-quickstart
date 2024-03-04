import { Service } from '@/client';
import { TOKENS } from '@/constants';
import { SpawnScreen } from '@/enums';
import { useServices, useAppInfo, useSpawn } from '@/hooks';
import EthersService from '@/service/Ethers';
import { Address, AddressNumberRecord } from '@/types';
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
  const { setSpawnData, serviceTemplate, rpc } = useSpawn();
  const { createService } = useServices();
  const { userPublicKey } = useAppInfo();

  const [isCreating, setIsCreating] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<ButtonOptions>();

  /**
   * Creates service, then performs relevant state updates
   */
  const create = useCallback(
    async (useStaking: boolean) => {
      if (isCreating) {
        message.error('Service creation already in progress');
        return;
      }

      if (!serviceTemplate || !rpc) {
        setSpawnData((prev) => ({ ...prev, screen: SpawnScreen.ERROR }));
        return;
      }

      setIsCreating(true);

      let service: Service;
      try {
        service = await createService({
          ...serviceTemplate,
          configuration: {
            ...serviceTemplate.configuration,
            rpc,
            use_staking: useStaking,
          },
        });
      } catch (e) {
        message.error('Failed to create service');
        setIsCreating(false);
        return;
      }

      //  Set agent funding requirements
      let agentFundRequirements: AddressNumberRecord = {};
      if (service.chain_data?.instances) {
        agentFundRequirements = service.chain_data.instances.reduce(
          (acc: AddressNumberRecord, address: Address) => ({
            ...acc,
            [address]: serviceTemplate.configuration.fund_requirements.agent,
          }),
          {},
        );
      }

      // Set multisig funding requirements from multisig/safe
      if (service.chain_data?.multisig) {
        const { multisig } = service.chain_data;
        const { safe } = serviceTemplate.configuration.fund_requirements;
        agentFundRequirements[multisig] = safe;
      }

      setSpawnData((prev) => ({ ...prev, agentFundRequirements }));

      return service;
    },
    [createService, isCreating, rpc, serviceTemplate, setSpawnData],
  );

  /**
   * Checks if the user has the required OLAS to stake
   */
  const preflightStakingCheck = useCallback((): Promise<boolean> => {
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

    const canStake: boolean = await preflightStakingCheck().catch((e) => {
      message.error(e);
      return false;
    });

    if (!canStake) {
      message.error(`${userPublicKey} requires more OLAS to stake`);
      return setButtonClicked(undefined);
    }

    const service: Service | undefined = await create(true);

    if (!service) {
      message.error('Failed to create service');
    } else {
      message.success('Service created successfully');

      setSpawnData((prev) => ({
        ...prev,
        isStaking: true,
        screen: nextPage,
      }));
    }

    setButtonClicked(undefined);
  };

  const handleNo = async () => {
    setButtonClicked(ButtonOptions.NO);

    const service: Service | undefined = await create(false);

    if (!service) {
      message.error('Failed to create service');
    } else {
      message.success('Service created successfully');

      setSpawnData((prev) => ({
        ...prev,
        isStaking: false,
        screen: nextPage,
      }));
    }
    setButtonClicked(undefined);
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
