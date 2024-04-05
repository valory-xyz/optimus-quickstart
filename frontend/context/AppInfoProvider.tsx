import { message } from 'antd';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';

import { AppInfo } from '@/client';
import { AppInfoService } from '@/service';

type AppInfoContextProps = {
  appInfo?: AppInfo;
};

export const AppInfoContext = createContext<AppInfoContextProps>({
  appInfo: undefined,
});

export const AppInfoProvider = ({ children }: PropsWithChildren) => {
  const [appInfo, setAppInfo] = useState<AppInfo>();

  useEffect(() => {
    AppInfoService.getAppInfo()
      .then(setAppInfo)
      .catch(() => message.error('Failed to get app info'));
  }, []);

  return (
    <AppInfoContext.Provider value={{ appInfo }}>
      {children}
    </AppInfoContext.Provider>
  );
};
