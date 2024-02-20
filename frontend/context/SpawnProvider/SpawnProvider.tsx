import { SpawnScreenState } from "@/enums/SpawnState";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from "react";

type SpawnContextType = {
  spawnScreenState: SpawnScreenState;
  firstSpawnScreenState: SpawnScreenState;
  setSpawnScreenState: Dispatch<SetStateAction<SpawnScreenState>>;
};

export const FIRST_SPAWN_SCREEN_STATE: SpawnScreenState = SpawnScreenState.RPC;

export const SpawnContext = createContext<SpawnContextType>({
  spawnScreenState: FIRST_SPAWN_SCREEN_STATE,
  firstSpawnScreenState: FIRST_SPAWN_SCREEN_STATE,
  setSpawnScreenState: () => {},
});

export const SpawnProvider = ({ children }: PropsWithChildren) => {
  const [spawnScreenState, setSpawnScreenState] = useState<SpawnScreenState>(
    FIRST_SPAWN_SCREEN_STATE,
  );
  return (
    <SpawnContext.Provider
      value={{
        firstSpawnScreenState: FIRST_SPAWN_SCREEN_STATE,
        spawnScreenState,
        setSpawnScreenState,
      }}
    >
      {children}
    </SpawnContext.Provider>
  );
};
