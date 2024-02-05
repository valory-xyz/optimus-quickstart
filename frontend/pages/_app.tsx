import { Layout } from "@/components/Layout/Layout";
import { AgentsProvider } from "@/context/AgentsProvider";
import { TabsProvider } from "@/context/TabsProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AgentsProvider>
      <TabsProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </TabsProvider>
    </AgentsProvider>
  );
}
