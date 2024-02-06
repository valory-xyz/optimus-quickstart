import { SpawnState } from "@/enums/SpawnState";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

type SpawnContextType = {
    spawnState: SpawnState;
    setSpawnState: Dispatch<SetStateAction<SpawnState>>;
}

export const SpawnContext = createContext<SpawnContextType>({
    spawnState: SpawnState.RPC,
    setSpawnState: () => { }
})

export const SpawnProvider = ({ children }: PropsWithChildren) => {
    const [spawnState, setSpawnState] = useState<SpawnState>(SpawnState.RPC);
    return (
        <SpawnContext.Provider value={{ spawnState, setSpawnState }}>
            {children}
        </SpawnContext.Provider>
    )
}