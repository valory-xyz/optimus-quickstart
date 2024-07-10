import { createContext, PropsWithChildren, useState } from 'react';

import { SettingsScreen } from '@/enums/SettingsScreen';

export const SettingsContext = createContext<{
  screen: SettingsScreen;
  goto: (screen: SettingsScreen) => void;
}>({
  screen: SettingsScreen.Main,
  goto: () => {},
});

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [screen, setScreen] = useState<SettingsScreen>(SettingsScreen.Main);

  const goto = (screen: SettingsScreen) => setScreen(screen);

  return (
    <SettingsContext.Provider value={{ screen, goto }}>
      {children}
    </SettingsContext.Provider>
  );
};
