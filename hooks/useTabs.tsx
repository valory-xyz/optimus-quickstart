import { TabsContext } from "@/context";
import { useContext } from "react";

export const useTabs = () => {
  return useContext(TabsContext);
};
