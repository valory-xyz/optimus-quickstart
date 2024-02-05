import { AgentsProvider } from "@/context/AgentsProvider";
import { TabsProvider } from "@/context/TabsProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AgentsProvider>
      <TabsProvider>
        <Component {...pageProps} />
      </TabsProvider>
    </AgentsProvider>
  );
}
