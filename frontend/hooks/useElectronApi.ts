import { useContext } from 'react';

import { ElectronApiContext } from '@/context/ElectronApiProvider';

export const useElectronApi = () => useContext(ElectronApiContext);
