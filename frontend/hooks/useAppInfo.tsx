import { AppInfoContext } from "@/context/AppInfoProvider/AppInfoProvider";
import { useContext } from "react";

export const useAppInfo = () => {
  const { appInfo } = useContext(AppInfoContext);

  const getPublicKey = () => appInfo?.account.key;

  return {
    getPublicKey,
  };
};
