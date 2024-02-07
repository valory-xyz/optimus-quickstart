import { Tab } from "@/enums";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from "react";

export const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}>({ activeTab: Tab.YOUR_AGENTS, setActiveTab: () => {} });

export const TabsProvider = ({ children }: PropsWithChildren) => {
  const [activeTab, setActiveTab] = useState<string>(Tab.YOUR_AGENTS);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};
