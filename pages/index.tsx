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
  const {
    updateServices,
    services,
    updateServiceStatus,
    buildService,
    startService,
    stopService,
  } = useServices();

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
            <Button
              onClick={() =>
                updateServiceStatus(services[0].hash, ServiceStatus.BUILDING)
              }
            >
              Set Service Status Building
            </Button>
            <Button
              onClick={() =>
                updateServiceStatus(services[0].hash, ServiceStatus.RUNNING)
              }
            >
              Set Service Status Running
            </Button>
            <Button
              onClick={() =>
                updateServiceStatus(services[0].hash, ServiceStatus.STOPPED)
              }
            >
              Set Service Status Stopped
            </Button>
            <Button onClick={() => buildService(services[0].hash)}>
              Build Service
            </Button>
            <Button onClick={() => startService(services[0].hash)}>
              Start Service
            </Button>
            <Button onClick={() => stopService(services[0].hash)}>
              Stop Service
            </Button>
          </Flex>
        ),
      },
    ],
    [
      buildService,
      services,
      startService,
      stopService,
      updateServiceStatus,
      updateServices,
    ],
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
