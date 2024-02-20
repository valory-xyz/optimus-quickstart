import { AppInfo } from "@/client";
import { BACKEND_URL } from "@/constants";

/**
 * Get the app info, including users public key key
 */
const getAppInfo = async (): Promise<AppInfo> => {
  return fetch(`${BACKEND_URL}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
};

export const AppInfoService = {
  getAppInfo,
};
