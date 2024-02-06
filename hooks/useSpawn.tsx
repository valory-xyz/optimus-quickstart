import { SpawnContext } from "@/context/SpawnContext";
import { useContext } from "react"

export const useSpawn = () => {
    const {spawnState, setSpawnState} = useContext(SpawnContext);

    return {spawnState};
}