import { Layout } from "@/components/Layout/Layout";
import { Marketplace } from "@/components/Marketplace/Marketplace";
import { YourAgents } from "@/components/YourAgents/YourAgents";
import { Tab } from "@/enums";
import { useBackend } from "@/hooks/useBackend";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex, Tabs, type TabsProps } from "antd";
import { useMemo } from "react";

export default function Home() {
  const { activeTab, setActiveTab } = useTabs();
  const {
    getServices,
    getKeys,
    createKeys,
    getVars,
    startService,
    stopService,
  } = useBackend();

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
      {
        key: Tab.TEST,
        label: "Test",
        children: (
          <Flex vertical>
            <Button onClick={getServices}>getServices</Button>
          </Flex>
        ),
      },
    ],
    [getServices],
  );

  return (
    <Layout>
      <Tabs
        items={tabs}
        centered
        activeKey={activeTab}
        onChange={(activeKey: string) => setActiveTab(activeKey)}
      />
    </Layout>
  );
}
