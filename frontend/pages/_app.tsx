import { TabProvider } from "@/context/TabProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <TabProvider><Component {...pageProps} /></TabProvider>;
}
