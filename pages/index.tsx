import { Layout } from "@/components/Layout/Layout";
import { Marketplace } from "@/components/Marketplace/Marketplace";
import { YourAgents } from "@/components/YourAgents/YourAgents";
import { Tab } from "@/enums";
import { ServiceStatus } from "@/enums/ServiceStatus";
import { useServices } from "@/hooks/useServices";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex, Tabs, type TabsProps } from "antd";
import { useMemo } from "react";

export default function Home() {
  const { activeTab, setActiveTab } = useTabs();
  const { updateServices, services, updateServiceStatus, buildService, startService, stopService } = useServices();

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
            <Button onClick={updateServices}>updateServices</Button>
            <Button onClick={() => console.log(services)}>Log Services</Button>
            <Button onClick={() => updateServiceStatus(Object.keys(services[0])[0], ServiceStatus.BUILDING)}>Set Service Status Building</Button>
            <Button onClick={() => updateServiceStatus(Object.keys(services[0])[0], ServiceStatus.RUNNING)}>Set Service Status Running</Button>
            <Button onClick={() => updateServiceStatus(Object.keys(services[0])[0], ServiceStatus.STOPPED)}>Set Service Status Stopped</Button>
            <Button onClick={() => buildService(Object.keys(services[0])[0])}>Build Service</Button>
            <Button onClick={() => startService(Object.keys(services[0])[0])}>Start Service</Button>
            <Button onClick={() => stopService(Object.keys(services[0])[0])}>Stop Service</Button>
          </Flex>
        ),
      },
    ],
    [updateServices],
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
