import { useContext, useMemo } from 'react';

import { SetupContext } from '@/context';
import { SetupScreen } from '@/enums';

import { SetupBackup } from './SetupBackup';
import { SetupPassword } from './SetupPassword';
import { SetupWelcome } from './SetupWelcome';

export const Setup = () => {
  const { setupObject } = useContext(SetupContext);
  const setupScreen = useMemo(() => {
    switch (setupObject.state) {
      case SetupScreen.Welcome:
        return <SetupWelcome />;
      case SetupScreen.Password:
        return <SetupPassword />;
      case SetupScreen.Backup:
        return <SetupBackup />;
      default:
        return <>Error</>;
    }
  }, [setupObject.state]);

  return setupScreen;
};
