import { SpawnScreen } from '@/enums';
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

const FIRST_SPAWN_SCREEN: SpawnScreen = SpawnScreen.RPC;

export const DEFAULT_SPAWN_DATA: SpawnData = {
  agentFundRequirements: {},
  masterWalletFundRequirements: {},
  isStaking: undefined,
  nativeBalance: undefined,
  rpc: '',
  screen: FIRST_SPAWN_SCREEN,
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
