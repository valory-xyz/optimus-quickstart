import { Service } from '@/client';
import { DEFAULT_SPAWN_DATA, SpawnContext } from '@/context';
import { SpawnScreen } from '@/enums';
import { useCallback, useContext, useMemo } from 'react';
import { Address, FundingRecord } from '@/types';
import { message } from 'antd';
import { ServicesService } from '@/service';

export const useSpawn = () => {
  const { spawnData, setSpawnData } = useContext(SpawnContext);

  // MEMOS
  const spawnPercentage: number = useMemo(() => {
    // Staking path
    switch (spawnData.screen) {
      case SpawnScreen.RPC:
        return 0;
      case SpawnScreen.STAKING_CHECK:
        return 33;
      case SpawnScreen.AGENT_FUNDING:
        return 66;
      case SpawnScreen.DONE:
        return 100;
      default:
        return 0;
    }
  }, [spawnData.screen]);

  // METHODS
  const createService = useCallback(
    async (useStaking: boolean): Promise<Service | undefined> => {
      if (!spawnData.serviceTemplate || !spawnData.rpc) {
        setSpawnData((prev) => ({ ...prev, screen: SpawnScreen.ERROR }));
        return;
      }

      let service: Service;
      try {
        service = await ServicesService.createService({
          ...spawnData.serviceTemplate,
          configuration: {
            ...spawnData.serviceTemplate.configuration,
            rpc: spawnData.rpc,
            use_staking: useStaking,
          },
        });
      } catch (e) {
        message.error('Failed to create service');
        return;
      }

      setSpawnData((prev) => ({ ...prev, service }));
      return service;
    },
    [setSpawnData, spawnData.rpc, spawnData.serviceTemplate],
  );

  const resetSpawn = useCallback(
    (): void => setSpawnData(DEFAULT_SPAWN_DATA),
    // does not require any dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Creates agent funding requirements in spawnData
   */
  const createAgentFundRequirements = useCallback(():
    | FundingRecord
    | undefined => {
    if (!spawnData.serviceTemplate || !spawnData.service?.chain_data.instances)
      return undefined;

    //  Agent funding requirements
    let agentFundRequirements: FundingRecord = {};

    const required =
      spawnData.serviceTemplate.configuration.fund_requirements.agent;

    agentFundRequirements = spawnData.service.chain_data.instances.reduce(
      (acc: FundingRecord, address: Address) => ({
        ...acc,
        [address]: {
          required,
          received: false,
        },
      }),
      {},
    );

    // Multisig funding requirements
    if (spawnData.service.chain_data?.multisig) {
      const { multisig } = spawnData.service.chain_data;
      const { safe } =
        spawnData.serviceTemplate.configuration.fund_requirements;
      agentFundRequirements[multisig] = { required: safe, received: false };
    }

    setSpawnData((prev) => ({ ...prev, agentFundRequirements }));
  }, [setSpawnData, spawnData.service, spawnData.serviceTemplate]);

  return {
    ...spawnData,
    spawnData,
    spawnPercentage,
    createService,
    resetSpawn,
    setSpawnData,
    createAgentFundRequirements,
  };
};
