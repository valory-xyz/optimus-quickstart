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
  setSpawnScreenState: Dispatch<SetStateAction<SpawnScreenState>>;
};

export const SpawnContext = createContext<SpawnContextType>({
  spawnScreenState: SpawnScreenState.RPC,
  setSpawnScreenState: () => {},
});

export const SpawnProvider = ({ children }: PropsWithChildren) => {
  const [spawnScreenState, setSpawnScreenState] = useState<SpawnScreenState>(
    SpawnScreenState.RPC,
  );
  return (
    <SpawnContext.Provider
      value={{
        spawnScreenState: spawnScreenState,
        setSpawnScreenState: setSpawnScreenState,
      }}
    >
      {children}
    </SpawnContext.Provider>
  );
};
