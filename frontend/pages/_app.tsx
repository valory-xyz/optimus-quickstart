import { AppInfoProvider } from '@/context';
import { mainTheme } from '@/theme';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import '../styles/globals.scss';
import { PageStateProvider } from '@/context/PageStateProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppInfoProvider>
      <ConfigProvider theme={mainTheme}>
        <PageStateProvider>
          <Component {...pageProps} />
        </PageStateProvider>
      </ConfigProvider>
    </AppInfoProvider>
  );
}
