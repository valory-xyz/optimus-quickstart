import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';

import { SetupScreen } from '@/enums/SetupScreen';

type SetupObjectType = {
  state: SetupScreen;
  mnemonic: string[];
};

type SetupContextType = {
  setupObject: SetupObjectType;
  setSetupObject: Dispatch<SetStateAction<SetupObjectType>>;
};

export const SetupContext = createContext<SetupContextType>({
  setupObject: {
    state: SetupScreen.Welcome,
    mnemonic: [],
  },
  setSetupObject: () => {},
});

export const SetupProvider = ({ children }: PropsWithChildren) => {
  const [setupObject, setSetupObject] = useState<SetupObjectType>({
    state: SetupScreen.Welcome,
    mnemonic: [],
  });

  return (
    <SetupContext.Provider value={{ setupObject, setSetupObject }}>
      {children}
    </SetupContext.Provider>
  );
};
