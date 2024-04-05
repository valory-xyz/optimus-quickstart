import { useContext } from 'react';

import { SetupContext } from '@/context';
import { SetupScreen } from '@/enums';

export const useSetup = () => {
  const { setupObject, setSetupObject } = useContext(SetupContext);

  const goto = (state: SetupScreen) => {
    setSetupObject((prev) => ({ ...prev, state }));
  };

  const setMnemonic = (mnemonic: string[]) =>
    setSetupObject((prev) => Object.assign(prev, { mnemonic }));

  return {
    ...setupObject,
    setMnemonic,
    goto,
  };
};
