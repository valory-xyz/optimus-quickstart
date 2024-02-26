import { Service, ServiceTemplate } from '@/client';
import { TOKENS } from '@/constants';
import { SpawnScreenState } from '@/enums';
import { useEthers, useServices, useAppInfo } from '@/hooks';
import { Address, FundsRequirementMap } from '@/types';
import { Button, Flex, Typography, message } from 'antd';
import { ethers } from 'ethers';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

enum ButtonOptions {
  YES,
  NO,
}

type SpawnStakingCheckProps = {
  serviceTemplate: ServiceTemplate;
  rpc: string;
  setAgentFundRequirements: Dispatch<SetStateAction<FundsRequirementMap>>;
  setSpawnScreenState: Dispatch<SetStateAction<SpawnScreenState>>;
  setIsStaking: Dispatch<SetStateAction<boolean>>;
  setService: Dispatch<SetStateAction<Service | undefined>>;
  nextPage: SpawnScreenState;
};

export const SpawnStakingCheck = ({
  serviceTemplate,
  rpc,
  setAgentFundRequirements,
  setSpawnScreenState,
  setIsStaking,
  setService,
  nextPage,
}: SpawnStakingCheckProps) => {
  const { createService } = useServices();
  const { userPublicKey } = useAppInfo();
  const { getErc20Balance } = useEthers();
  const { updateServiceState } = useServices();

  const [isCreating, setIsCreating] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<ButtonOptions>();

  /**
   * Creates service, then performs relevant state updates
   */
  const create = useCallback(
    async (isStaking: boolean) => {
      if (isCreating) {
        message.error('Service creation already in progress');
        return;
      }
      setIsCreating(true);
      return createService({
        ...serviceTemplate,
        configuration: {
          ...serviceTemplate.configuration,
          rpc,
          use_staking: isStaking,
        },
      })
        .then((service: Service) => {
          setService(service);

          //  Set agent funding requirements
          if (service.chain_data?.instances) {
            setAgentFundRequirements(
              service.chain_data.instances.reduce(
                (acc: FundsRequirementMap, address: Address) => ({
                  ...acc,
                  [address]:
                    serviceTemplate.configuration.fund_requirements.agent,
                }),
                {},
              ),
            );
          }

          // Set multisig funding requirements from multisig/safe
          if (service.chain_data?.multisig) {
            const { multisig } = service.chain_data;
            const { safe } = serviceTemplate.configuration.fund_requirements;
            setAgentFundRequirements((prev: FundsRequirementMap) => ({
              ...prev,
              [multisig]: safe,
            }));
          }
          return Promise.resolve(service);
        })
        .catch(() => {
          return Promise.reject();
        })
        .finally(() => setIsCreating(false));
    },
    [
      createService,
      isCreating,
      rpc,
      serviceTemplate,
      setAgentFundRequirements,
      setService,
    ],
  );

  /**
   * Checks if the user has the required OLAS to stake
   */
  const preflightStakingCheck = useCallback((): Promise<boolean> => {
    if (!userPublicKey) {
      return Promise.reject('No public key found');
    }
    return getErc20Balance(userPublicKey, rpc, TOKENS.gnosis.OLAS)
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
      .catch((e) => {
        return Promise.reject(e);
      });
  }, [getErc20Balance, userPublicKey, rpc, serviceTemplate.configuration]);

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
      if (canStake && service) {
        await updateServiceState(service.hash).catch(() =>
          message.error('Failed to update service state'),
        );
        setIsStaking(true);
        setSpawnScreenState(nextPage);
      }
      setButtonClicked(undefined);
    }
  };

  const handleNo = async () => {
    setButtonClicked(ButtonOptions.NO);

    const service: Service | undefined = await create(false);
    if (!service) {
      message.error('Failed to create service');
    } else {
      message.success('Service created successfully');

      await updateServiceState(service.hash).catch(() =>
        message.error('Failed to update service state'),
      );

      setIsStaking(false);
      setSpawnScreenState(nextPage);
    }
    setButtonClicked(undefined);
  };

  const stakingRequirement = useMemo(() => {
    const { olas_required_to_stake, olas_cost_of_bond } =
      serviceTemplate.configuration;
    return ethers.utils.formatUnits(
      `${olas_required_to_stake + olas_cost_of_bond}`,
    );
  }, [serviceTemplate.configuration]);

  return (
    <Flex gap={8} vertical>
      <Flex vertical justify="center" align="center">
        <Typography.Text strong>Would you like to stake OLAS?</Typography.Text>
        <Typography.Text type="secondary">
          {stakingRequirement} OLAS required
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
