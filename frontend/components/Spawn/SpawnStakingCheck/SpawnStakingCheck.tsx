import { Service, ServiceTemplate } from "@/client";
import { TOKENS } from "@/constants/tokens";
import { SpawnScreenState } from "@/enums";
import { useEthers, useServices } from "@/hooks";
import { useAppInfo } from "@/hooks/useAppInfo";
import { Button, Flex, Typography, message } from "antd";
import { ethers } from "ethers";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

enum ButtonOptions {
  YES,
  NO,
}

export const SpawnStakingCheck = ({
  serviceTemplate,
  rpc,
  setAgentFundRequirements,
  setSpawnScreenState,
  setIsStaking,
  setService,
  nextPage,
}: {
  serviceTemplate: ServiceTemplate;
  rpc: string;
  setAgentFundRequirements: Dispatch<
    SetStateAction<{ [address: string]: number }>
  >;
  setSpawnScreenState: Dispatch<SetStateAction<SpawnScreenState>>;
  setIsStaking: Dispatch<SetStateAction<boolean>>;
  setService: Dispatch<SetStateAction<Service | undefined>>;
  nextPage: SpawnScreenState;
}) => {
  const { createService } = useServices();
  const { getPublicKey } = useAppInfo();
  const { getERC20Balance } = useEthers();

  const [isCreating, setIsCreating] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<ButtonOptions>();

  const publicKey = useMemo(() => getPublicKey(), [getPublicKey]);

  /**
   * Creates service, then performs relevant state updates
   */
  const create = useCallback(
    async (isStaking: boolean) => {
      if (isCreating) {
        message.error("Service creation already in progress");
        return;
      }
      setIsCreating(true);
      await createService({
        ...serviceTemplate,
        configuration: {
          ...serviceTemplate.configuration,
          rpc,
          use_staking: isStaking,
        },
      })
        .then((_service: Service) => {
          setService(_service);

          //  Set agent funding requirements
          if (_service.chain_data?.instances) {
            setAgentFundRequirements(
              _service.chain_data.instances.reduce(
                (acc: { [address: string]: number }, address: string) => ({
                  ...acc,
                  [address]:
                    serviceTemplate.configuration.fund_requirements.agent,
                }),
                {},
              ),
            );
          }

          // Set staking funding requirements from multisig/safe
          if (_service.chain_data?.multisig) {
            setAgentFundRequirements((prev) => ({
              ...prev,
              [_service.chain_data?.multisig as string]:
                serviceTemplate.configuration.fund_requirements.safe,
            }));
          }
          return Promise.resolve();
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
    if (!publicKey) {
      return Promise.reject("No public key found");
    }
    return getERC20Balance(publicKey, rpc, TOKENS.gnosis.OLAS)
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
          return Promise.reject("Failed to calculate if user has balance");
        }
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  }, [getERC20Balance, publicKey, rpc, serviceTemplate.configuration]);

  const handleYes = async () => {
    setButtonClicked(ButtonOptions.YES);
    const canStake: boolean = await preflightStakingCheck().catch((e) => {
      message.error(e);
      return false;
    });
    if (!canStake) {
      message.error("You need more OLAS to stake");
      return setButtonClicked(undefined);
    }
    const hasCreated: boolean = await create(true)
      .then(() => {
        {
          message.success("Service created successfully");
          return true;
        }
      })
      .catch(() => {
        message.error("Failed to create service");
        return false;
      });
    if (canStake && hasCreated) {
      setIsStaking(true);
      setSpawnScreenState(nextPage);
    }
    setButtonClicked(undefined);
  };

  const handleNo = async () => {
    setButtonClicked(ButtonOptions.NO);
    const hasCreated: boolean = await create(false)
      .then(() => {
        message.success("Service created successfully");
        return true;
      })
      .catch(() => {
        message.error("Failed to create service");
        return false;
      });
    if (hasCreated) {
      setIsStaking(false);
      setSpawnScreenState(nextPage);
    }
    setButtonClicked(undefined);
  };

  return (
    <Flex gap={8} vertical>
      <Flex justify="center">
        <Typography.Text strong>Would you like to stake OLAS?</Typography.Text>
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
