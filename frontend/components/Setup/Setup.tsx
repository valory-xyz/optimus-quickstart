import { useContext, useMemo } from 'react';

import { SetupContext } from '@/context';
import { SetupScreen } from '@/enums';

import { SetupBackup } from './Create/SetupBackup';
import { SetupPassword } from './Create/SetupPassword';
import {
  SetupRestoreMain,
  SetupRestoreSetPassword,
  SetupRestoreViaBackup,
  SetupRestoreViaSeed,
} from './SetupRestore';
import { SetupWelcome } from './SetupWelcome';

export const Setup = () => {
  const { setupObject } = useContext(SetupContext);
  const setupScreen = useMemo(() => {
    switch (setupObject.state) {
      case SetupScreen.Welcome:
        return <SetupWelcome />;
      // Create account
      case SetupScreen.SetupPassword:
        return <SetupPassword />;
      case SetupScreen.SetupBackup:
        return <SetupBackup />;
      // Restore account
      case SetupScreen.Restore:
        return <SetupRestoreMain />;
      case SetupScreen.RestoreViaSeed:
        return <SetupRestoreViaSeed />;
      case SetupScreen.RestoreSetPassword:
        return <SetupRestoreSetPassword />;
      case SetupScreen.RestoreViaBackup:
        return <SetupRestoreViaBackup />;
      default:
        return <>Error</>;
    }
  }, [setupObject.state]);

  return setupScreen;
};
