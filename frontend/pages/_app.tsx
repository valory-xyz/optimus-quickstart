import '../styles/globals.scss';

import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import { useEffect, useRef } from 'react';

import {
  AppInfoProvider,
  PageStateProvider,
  ServicesProvider,
  SetupProvider,
} from '@/context';
import { BalanceProvider } from '@/context/BalanceProvider';
import { mainTheme } from '@/theme';

export default function App({ Component, pageProps }: AppProps) {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <AppInfoProvider>
      <PageStateProvider>
        <ServicesProvider>
          <BalanceProvider>
            <SetupProvider>
              {isMounted ? (
                <ConfigProvider theme={mainTheme}>
                  <Component {...pageProps} />
                </ConfigProvider>
              ) : null}
            </SetupProvider>
          </BalanceProvider>
        </ServicesProvider>
      </PageStateProvider>
    </AppInfoProvider>
  );
}
