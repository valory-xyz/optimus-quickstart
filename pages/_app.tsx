import { AgentsProvider } from "@/context/AgentsProvider";
import { SpawnProvider } from "@/context/SpawnContext";
import { TabsProvider } from "@/context/TabsProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AgentsProvider>
      <SpawnProvider>
        <TabsProvider>
          <Component {...pageProps} />
        </TabsProvider>
      </SpawnProvider>
    </AgentsProvider>
  );
}
