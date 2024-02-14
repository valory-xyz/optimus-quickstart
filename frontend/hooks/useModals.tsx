import { ModalsContext } from "@/context";
import { useContext } from "react";

export const useModals = () => {
  return useContext(ModalsContext);
};
