import { useContext } from 'react';

import { SetupContext } from '@/context';
import { SetupScreen } from '@/enums';
import { Address } from '@/types';

export const useSetup = () => {
  const { setupObject, setSetupObject } = useContext(SetupContext);

  const goto = (state: SetupScreen) => {
    setSetupObject((prev) => ({ ...prev, state }));
  };

  const setMnemonic = (mnemonic: string[]) =>
    setSetupObject((prev) => Object.assign(prev, { mnemonic }));

  const setBackupSigner = (backupSigner: Address) =>
    setSetupObject((prev) => Object.assign(prev, { backupSigner }));

  return {
    ...setupObject,
    setMnemonic,
    setBackupSigner,
    goto,
  };
};
