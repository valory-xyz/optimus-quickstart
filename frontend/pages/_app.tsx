import '../styles/globals.scss';

import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';

import {
  AppInfoProvider,
  PageStateProvider,
  ServicesProvider,
  SetupProvider,
} from '@/context';
import { mainTheme } from '@/theme';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppInfoProvider>
      <ServicesProvider>
        <ConfigProvider theme={mainTheme}>
          <PageStateProvider>
            <SetupProvider>
              <Component {...pageProps} />
            </SetupProvider>
          </PageStateProvider>
        </ConfigProvider>
      </ServicesProvider>
    </AppInfoProvider>
  );
}
