import '../styles/globals.scss';

import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';

import {
  AppInfoProvider,
  PageStateProvider,
  ServicesProvider,
  SetupProvider,
} from '@/context';
import { WalletProvider } from '@/context/WalletProvider';
import { mainTheme } from '@/theme';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppInfoProvider>
      <PageStateProvider>
        <ServicesProvider>
          <WalletProvider>
            <ConfigProvider theme={mainTheme}>
              <SetupProvider>
                <Component {...pageProps} />
              </SetupProvider>
            </ConfigProvider>
          </WalletProvider>
        </ServicesProvider>
      </PageStateProvider>
    </AppInfoProvider>
  );
}
