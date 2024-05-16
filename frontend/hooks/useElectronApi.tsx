import { useContext } from 'react';

import { ElectronApiContext } from '@/context/ElectronApiProvider';

export const useElectronApi = () => {
  const { setHeight, closeApp, minimizeApp, setFullHeight } =
    useContext(ElectronApiContext);

  return {
    setHeight,
    setFullHeight,
    closeApp,
    minimizeApp,
  };
};
