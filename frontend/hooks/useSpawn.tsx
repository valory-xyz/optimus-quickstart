import { SpawnContext } from '@/context';
import { SpawnScreenState } from '@/enums';
import { useCallback, useContext, useMemo } from 'react';

export const useSpawn = () => {
  const { spawnScreenState, setSpawnScreenState, firstSpawnScreenState } =
    useContext(SpawnContext);

  const spawnPercentage: number = useMemo(() => {
    // Staking path
    switch (spawnScreenState) {
      case SpawnScreenState.RPC:
        return 0;
      case SpawnScreenState.STAKING_CHECK:
        return 33;
      case SpawnScreenState.AGENT_FUNDING:
        return 66;
      case SpawnScreenState.DONE:
        return 100;
      default:
        break;
    }
    return 0;
  }, [spawnScreenState]);

  const resetSpawnScreenState = useCallback(
    (): void => setSpawnScreenState(firstSpawnScreenState),
    [firstSpawnScreenState, setSpawnScreenState],
  );

  return {
    spawnScreenState,
    setSpawnScreenState,
    spawnPercentage,
    resetSpawnScreenState,
  };
};
