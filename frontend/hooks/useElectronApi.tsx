import { useContext } from 'react';

import { ElectronApiContext } from '@/context/ElectronApiProvider';

export const useElectronApi = () => {
  const { setHeight, closeApp, minimizeApp } = useContext(ElectronApiContext);

  return {
    setHeight,
    closeApp,
    minimizeApp,
  };
};
