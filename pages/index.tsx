import { Layout } from "@/components/Layout/Layout";
import { Marketplace } from "@/components/Marketplace/Marketplace";
import { YourAgents } from "@/components/YourAgents/YourAgents";
import { Tab } from "@/enums";
import { useTabs } from "@/hooks/useTabs";
import { Tabs, type TabsProps } from "antd";
import { useMemo } from "react";

export default function Home() {
  const { activeTab, setActiveTab } = useTabs();

  const tabs: TabsProps["items"] = useMemo(
    () => [
      {
        key: Tab.YOUR_AGENTS,
        label: "Your Agents",
        children: <YourAgents />,
      },
      {
        key: Tab.MARKETPLACE,
        label: "Marketplace",
        children: <Marketplace />,
      },
    ],
    [],
  );

  return (
    <Layout>
      <Tabs
        items={tabs}
        activeKey={activeTab}
        onChange={(activeKey: string) => setActiveTab(activeKey)}
      />
    </Layout>
  );
}
