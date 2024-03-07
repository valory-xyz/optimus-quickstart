import { SpawnData } from '@/types';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from 'react';

type SpawnContextType = {
  spawnData: SpawnData;
  setSpawnData: Dispatch<SetStateAction<SpawnData>>;
};

export const DEFAULT_SPAWN_DATA: SpawnData = {
  agentFundRequirements: {},
  masterWalletFundRequirements: {},
  isStaking: undefined,
  nativeBalance: undefined,
  rpc: '',
  screen: undefined,
  serviceTemplate: undefined,
  service: undefined,
};

export const SpawnContext = createContext<SpawnContextType>({
  spawnData: DEFAULT_SPAWN_DATA,
  setSpawnData: () => {},
});

export const SpawnProvider = ({ children }: PropsWithChildren) => {
  const [spawnData, setSpawnData] = useState<SpawnData>(DEFAULT_SPAWN_DATA);
  return (
    <SpawnContext.Provider
      value={{
        spawnData,
        setSpawnData,
      }}
    >
      {children}
    </SpawnContext.Provider>
  );
};
