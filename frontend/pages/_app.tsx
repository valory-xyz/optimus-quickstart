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
import { WalletProvider } from '@/context/WalletProvider';
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
          <WalletProvider>
            <SetupProvider>
              {isMounted && (
                <ConfigProvider theme={mainTheme}>
                  <Component {...pageProps} />
                </ConfigProvider>
              )}
            </SetupProvider>
          </WalletProvider>
        </ServicesProvider>
      </PageStateProvider>
    </AppInfoProvider>
  );
}
