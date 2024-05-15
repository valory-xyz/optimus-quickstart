import '../styles/globals.scss';

import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import { useEffect, useRef } from 'react';

import { Layout } from '@/components/Layout';
import {
  AppInfoProvider,
  PageStateProvider,
  ServicesProvider,
  SetupProvider,
} from '@/context';
import { BalanceProvider } from '@/context/BalanceProvider';
import { RewardProvider } from '@/context/RewardProvider';
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
          <RewardProvider>
            <BalanceProvider>
              <SetupProvider>
                {isMounted ? (
                  <ConfigProvider theme={mainTheme}>
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  </ConfigProvider>
                ) : null}
              </SetupProvider>
            </BalanceProvider>
          </RewardProvider>
        </ServicesProvider>
      </PageStateProvider>
    </AppInfoProvider>
  );
}
