import { AgentsProvider } from "@/context/AgentsProvider";
import { SpawnProvider } from "@/context/SpawnContext";
import { TabsProvider } from "@/context/TabsProvider";
import { mainTheme } from "@/theme/mainTheme";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AgentsProvider>
      <SpawnProvider>
        <TabsProvider>
          <ConfigProvider theme={mainTheme}>
            <Component {...pageProps} />
          </ConfigProvider>
        </TabsProvider>
      </SpawnProvider>
    </AgentsProvider>
  );
}
