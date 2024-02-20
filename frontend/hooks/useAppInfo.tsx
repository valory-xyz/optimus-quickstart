import { AppInfoContext } from "@/context";
import { useContext } from "react";

export const useAppInfo = () => {
  const { appInfo } = useContext(AppInfoContext);

  const getPublicKey = () => appInfo?.account.key;

  return {
    getPublicKey,
  };
};
