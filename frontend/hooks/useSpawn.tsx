import { Service, ServiceTemplate } from '@/client';
import { DEFAULT_SPAWN_DATA, SpawnContext } from '@/context';
import { SpawnScreen } from '@/enums';
import { useCallback, useContext, useMemo } from 'react';
import { message } from 'antd';
import { ServicesService } from '@/service';
import { useAppInfo, useServiceTemplates, useServices } from '.';
import { Address, FundingRecord } from '@/types';

/**
 * Generates agent fund requirements from valid service and service template
 */
const getAgentFundRequirements = ({
  serviceTemplate,
  service,
}: {
  serviceTemplate: ServiceTemplate;
  service: Service;
}): FundingRecord | undefined => {
  if (!serviceTemplate || !service?.chain_data.instances) return undefined;

  //  Agent funding requirements
  let agentFundRequirements: FundingRecord = {};

  const required = serviceTemplate.configuration.fund_requirements.agent;

  agentFundRequirements = service.chain_data.instances.reduce(
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
  if (service.chain_data?.multisig) {
    const { multisig } = service.chain_data;
    const { safe } = serviceTemplate.configuration.fund_requirements;
    agentFundRequirements[multisig] = { required: safe, received: false };
  }

  return agentFundRequirements;
};

export const useSpawn = () => {
  const { spawnData, setSpawnData } = useContext(SpawnContext);
  const { getServiceFromState } = useServices();
  const { getServiceTemplate } = useServiceTemplates();
  const { userPublicKey } = useAppInfo();

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

      const agentFundRequirements = getAgentFundRequirements({
        serviceTemplate: spawnData.serviceTemplate,
        service,
      });
      if (!agentFundRequirements) return;

      setSpawnData((prev) => ({ ...prev, service, agentFundRequirements }));
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
   * Call once to load spawn data
   */
  const loadSpawn = useCallback(
    ({
      serviceTemplateHash,
      screen,
    }: {
      serviceTemplateHash: string;
      screen: SpawnScreen | null | undefined;
    }) => {
      if (!userPublicKey) return;
      try {
        const serviceTemplate = getServiceTemplate(serviceTemplateHash);
        if (!serviceTemplate) throw new Error('Service template not found');

        if (screen && screen !== null) {
          // Funding resume required
          const service = getServiceFromState(serviceTemplateHash);
          if (!service) throw new Error('Service not found');

          const {
            ledger: { rpc },
          } = service;

          const agentFundRequirements = getAgentFundRequirements({
            serviceTemplate,
            service,
          });

          if (!agentFundRequirements)
            throw new Error('Agent fund requirements not found');

          setSpawnData((prev) => ({
            ...prev,
            service,
            serviceTemplate,
            screen,
            rpc,
            masterWalletFundRequirements: {
              [userPublicKey]: { required: 1, received: false },
            },
            agentFundRequirements,
          }));
        } else {
          // No resume required
          setSpawnData((prev) => ({
            ...prev,
            serviceTemplate,
            screen: SpawnScreen.RPC,
            masterWalletFundRequirements: {
              [userPublicKey]: { required: 1, received: false },
            },
          }));
        }
      } catch (e) {
        setSpawnData((prev) => ({
          ...prev,
          screen: SpawnScreen.ERROR,
        }));
      }
    },
    [getServiceFromState, getServiceTemplate, setSpawnData, userPublicKey],
  );

  return {
    spawnData,
    spawnPercentage,
    getAgentFundRequirements,
    createService,
    loadSpawn,
    resetSpawn,
    setSpawnData,
  };
};
