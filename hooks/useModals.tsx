import { ModalsContext } from "@/context/ModalsProvider";
import { useContext } from "react";

export const useModals = () => {
  return useContext(ModalsContext);
};
