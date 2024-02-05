import { TabsContext } from "@/context/TabsProvider";
import { useContext } from "react";

export enum Tab {
  YOUR_AGENTS = "1",
  MARKETPLACE = "2",
}

export const useTabs = () => {
  return useContext(TabsContext);
};
