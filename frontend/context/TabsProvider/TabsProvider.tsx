import { Tab } from '@/enums';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from 'react';

type TabsContextProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
};

export const TabsContext = createContext<TabsContextProps>({
  activeTab: Tab.YOUR_AGENTS,
  setActiveTab: () => {},
});

export const TabsProvider = ({ children }: PropsWithChildren) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.YOUR_AGENTS);
  return (
    <TabsContext.Provider value={{ activeTab: activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};
