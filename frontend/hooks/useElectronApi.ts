import { useContext } from 'react';

import { ElectronApiContextProps } from '@/context/ElectronApiProvider';

export const useElectronApi = () => useContext(ElectronApiContext);
