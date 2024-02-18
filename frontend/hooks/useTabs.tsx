import { TabsContext } from "@/context";
import { Tab } from "@/enums";
import { useContext } from "react";

export const useTabs = () => {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  const resetTabs = () => {
    setActiveTab(Tab.YOUR_AGENTS);
  };

  return { activeTab, setActiveTab, resetTabs };
};
