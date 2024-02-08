import { AgentsProvider } from "@/context/AgentsProvider";
import { ModalsProvider } from "@/context/ModalsProvider";
import { ServicesProvider } from "@/context/ServicesProvider";
import { SpawnProvider } from "@/context/SpawnContext";
import { TabsProvider } from "@/context/TabsProvider";
import { mainTheme } from "@/theme/mainTheme";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ServicesProvider>
      <AgentsProvider>
        <SpawnProvider>
          <ModalsProvider>
            <TabsProvider>
              <ConfigProvider theme={mainTheme}>
                <Component {...pageProps} />
              </ConfigProvider>
            </TabsProvider>
          </ModalsProvider>
        </SpawnProvider>
      </AgentsProvider>
    </ServicesProvider>
  );
}
