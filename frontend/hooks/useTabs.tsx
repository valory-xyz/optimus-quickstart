import { TabsContext } from '@/context';
import { Tab } from '@/enums';
import { useContext } from 'react';

export const useTabs = () => {
  const { activeTab, setActiveTab: setTab } = useContext(TabsContext);

  const resetTabs = () => setActiveTab(Tab.YOUR_AGENTS);
  const setActiveTab = (tab: string) => setTab(tab as Tab); // casting needed to meet context useState requirements

  return { activeTab, setActiveTab, resetTabs };
};
