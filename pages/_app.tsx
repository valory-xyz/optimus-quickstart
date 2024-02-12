import {
  ModalsProvider,
  ServicesProvider,
  SpawnProvider,
  TabsProvider,
} from "@/context";
import { mainTheme } from "@/theme/mainTheme";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ServicesProvider>
      <SpawnProvider>
        <ModalsProvider>
          <TabsProvider>
            <ConfigProvider theme={mainTheme}>
              <Component {...pageProps} />
            </ConfigProvider>
          </TabsProvider>
        </ModalsProvider>
      </SpawnProvider>
    </ServicesProvider>
  );
}
