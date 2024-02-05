import { TabsContext } from "@/context/TabsProvider"
import { useContext } from "react";

export const useTabs = () => {
    return useContext(TabsContext);
}