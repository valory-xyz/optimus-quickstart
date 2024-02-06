import { Layout } from "@/components/Layout/Layout";
import { Marketplace } from "@/components/Marketplace/Marketplace";
import { YourAgents } from "@/components/YourAgents/YourAgents";
import { useAgents } from "@/hooks/useAgents";
import { useTabs } from "@/hooks/useTabs";
import { Button, Tabs, type TabsProps } from "antd";
import { useMemo } from "react";



export default function Home() {

  const { activeTab, setActiveTab } = useTabs();
  const { testFlask } = useAgents();

  const tabs: TabsProps["items"] = useMemo(() => [
    {
      key: "your-agents",
      label: "Your Agents",
      children: <YourAgents />,
    },
    {
      key: "marketplace",
      label: "Marketplace",
      children: <Marketplace />,
    },
    {
      key: "test",
      label: "Test",
      children: <Button onClick={testFlask} />,
    }
  ], [testFlask]);

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
