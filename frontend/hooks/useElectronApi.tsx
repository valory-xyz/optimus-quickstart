import { useContext } from 'react';

import { ElectronApiContext } from '@/context/ElectronApiProvider';

export const useElectronApi = () => {
  const { setHeight } = useContext(ElectronApiContext);

  return {
    setHeight,
  };
};
