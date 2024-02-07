import { SpawnState } from "@/enums/SpawnState";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from "react";

type SpawnContextType = {
  spawnState: SpawnState;
  setSpawnState: Dispatch<SetStateAction<SpawnState>>;
};

export const SpawnContext = createContext<SpawnContextType>({
  spawnState: SpawnState.LOADING,
  setSpawnState: () => {},
});

export const SpawnProvider = ({ children }: PropsWithChildren) => {
  const [spawnState, setSpawnState] = useState<SpawnState>(SpawnState.LOADING);
  return (
    <SpawnContext.Provider value={{ spawnState, setSpawnState }}>
      {children}
    </SpawnContext.Provider>
  );
};
