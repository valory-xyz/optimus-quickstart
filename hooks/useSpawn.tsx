import { SpawnContext } from "@/context/SpawnContext";
import { SpawnState } from "@/enums/SpawnState";
import { useContext, useMemo } from "react"

export const useSpawn = () => {
    const { spawnState, setSpawnState } = useContext(SpawnContext);

    const spawnPercentage = useMemo(() => {
        if (spawnState === SpawnState.RPC) return 33;
        if (spawnState === SpawnState.FUNDS) return 66;
        if (spawnState === SpawnState.DONE) return 100;
        return 0;
    }, [spawnState])

    return { spawnState, setSpawnState, spawnPercentage };
}