import { useContext } from 'react';

import { WalletContext } from '@/context/WalletProvider';

export const useWallet = () => useContext(WalletContext);
