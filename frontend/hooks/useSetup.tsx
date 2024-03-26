import { useContext } from 'react';

import { SetupContext } from '@/context';
import { SetupScreen } from '@/enums';

export const useSetup = () => {
  const { setupObject, setSetupObject } = useContext(SetupContext);

  const goto = (state: SetupScreen) => {
    setSetupObject((prev) => ({ ...prev, state }));
  };

  const { passwordHash, setPasswordHash } = {
    passwordHash: setupObject.passwordHash,
    setPasswordHash: (passwordHash: string) => {
      setSetupObject((prev) => ({ ...prev, passwordHash }));
    },
  };

  return {
    passwordHash,
    setPasswordHash,
    setupObject,
    goto,
  };
};
