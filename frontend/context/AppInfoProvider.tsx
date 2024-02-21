import { AppInfo } from '@/client';
import { AppInfoService } from '@/service';
import { message } from 'antd';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';

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
