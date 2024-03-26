import { AppInfoProvider, ServicesProvider } from '@/context';
import { mainTheme } from '@/theme';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import '../styles/globals.scss';
import { PageStateProvider } from '@/context/PageStateProvider';
import { SetupProvider } from '@/context/SetupProvider';

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
