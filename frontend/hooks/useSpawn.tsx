import { SpawnContext } from "@/context";
import { SpawnScreenState } from "@/enums";
import { useCallback, useContext, useMemo } from "react";

export const useSpawn = (isStaking?: boolean) => {
  const { spawnScreenState, setSpawnScreenState, firstSpawnScreenState } =
    useContext(SpawnContext);

  const spawnPercentage: number = useMemo(() => {
    if (spawnScreenState === SpawnScreenState.STAKING_CHECK) return 0;
    // Staking path
    if (isStaking) {
      switch (spawnScreenState) {
        case SpawnScreenState.RPC:
          return 25;
        case SpawnScreenState.STAKING_FUNDING:
          return 50;
        case SpawnScreenState.AGENT_FUNDING:
          return 75;
        case SpawnScreenState.DONE:
          return 100;
        default:
          break;
      }
    }
    // Non-staking path
    switch (spawnScreenState) {
      case SpawnScreenState.RPC:
        return 33;
      case SpawnScreenState.AGENT_FUNDING:
        return 66;
      case SpawnScreenState.DONE:
        return 100;
      default:
        break;
    }
    return 0;
  }, [isStaking, spawnScreenState]);

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
