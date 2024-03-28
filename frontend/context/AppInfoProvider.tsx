import { message } from 'antd';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { AppInfo } from '@/client';
import { AppInfoService } from '@/service';

type AppInfoContextProps = {
  appInfo?: AppInfo;
  setAppInfo: Dispatch<SetStateAction<AppInfo | undefined>>;
};

export const AppInfoContext = createContext<AppInfoContextProps>({
  appInfo: undefined,
  setAppInfo: () => {},
});

export const AppInfoProvider = ({ children }: PropsWithChildren) => {
  const [appInfo, setAppInfo] = useState<AppInfo>();

  useEffect(() => {
    AppInfoService.getAppInfo()
      .then(setAppInfo)
      .catch(() => message.error('Failed to get app info'));
  }, []);

  return (
    <AppInfoContext.Provider value={{ appInfo, setAppInfo }}>
      {children}
    </AppInfoContext.Provider>
  );
};
