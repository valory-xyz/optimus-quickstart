import { SpawnContext } from "@/context";
import { SpawnScreenState } from "@/enums";
import { useContext, useMemo } from "react";

export const useSpawn = () => {
  const { spawnScreenState, setSpawnScreenState: setSpawnScreenState } =
    useContext(SpawnContext);

  const spawnPercentage = useMemo(() => {
    if (spawnScreenState === SpawnScreenState.RPC) return 33;
    if (spawnScreenState === SpawnScreenState.FUNDS) return 66;
    if (spawnScreenState === SpawnScreenState.DONE) return 100;
    return 0;
  }, [spawnScreenState]);

  return {
    spawnScreenState,
    setSpawnScreenState,
    spawnPercentage,
  };
};
