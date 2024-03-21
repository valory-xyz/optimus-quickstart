import { AppInfoProvider } from '@/context';
import { mainTheme } from '@/theme';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppInfoProvider>
      <ConfigProvider theme={mainTheme}>
        <Component {...pageProps} />
      </ConfigProvider>
    </AppInfoProvider>
  );
}
