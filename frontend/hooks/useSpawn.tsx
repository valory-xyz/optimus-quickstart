import { ServiceTemplate } from '@/client';
import { DEFAULT_SPAWN_DATA, SpawnContext } from '@/context';
import { SpawnScreen } from '@/enums';
import { useCallback, useContext, useMemo } from 'react';
import { useMarketplace } from '.';

export const useSpawn = () => {
  const { getServiceTemplate } = useMarketplace();
  const { spawnData, setSpawnData } = useContext(SpawnContext);
  const { serviceTemplateHash, screen } = spawnData;

  const spawnPercentage: number = useMemo(() => {
    // Staking path
    switch (screen) {
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
  }, [screen]);

  const serviceTemplate: ServiceTemplate | undefined = useMemo(() => {
    if (!serviceTemplateHash) return;
    return getServiceTemplate(serviceTemplateHash);
  }, [getServiceTemplate, serviceTemplateHash]);

  const resetSpawn = useCallback(
    (): void => setSpawnData(DEFAULT_SPAWN_DATA),
    // does not require any dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    ...spawnData,
    spawnPercentage,
    serviceTemplate,
    setSpawnData,
    resetSpawn,
  };
};
