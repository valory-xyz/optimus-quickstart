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
}>({ activeTab: "1", setActiveTab: () => {} });

export const TabsProvider = ({ children }: PropsWithChildren) => {
  const [activeTab, setActiveTab] = useState<string>("1");
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};
