import { useContext } from 'react';

import { SettingsContext } from '@/context/SettingsProvider';

export const useSettings = () => {
  const { screen, goto } = useContext(SettingsContext);
  return { screen, goto };
};
