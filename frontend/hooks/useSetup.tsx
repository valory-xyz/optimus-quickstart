import { SetupContext } from '@/context/SetupProvider';
import { SetupScreen } from '@/enums/SetupScreen';
import { useContext } from 'react';

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
