import { Tab } from "@/enums/Tabs";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex, Typography } from "antd";

import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "./ServiceCard/ServiceCard";
import { Service } from "@/types/Service";

export const YourAgents = () => {
  const { services } = useServices();

  const hasAgents = services.reduce(
    (acc: boolean, service: Service) => (acc || service.built ? true : acc),
    false,
  );

  return hasAgents ? <HasServices services={services} /> : <NoAgents />;
};

const HasServices = ({ services }: { services: any[] }) => {
  return (
    <Flex vertical gap={16}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </Flex>
  );
};

const NoAgents = () => {
  const { setActiveTab } = useTabs();
  return (
    <Flex vertical justify="center" align="center">
      <Typography.Text>No agents running.</Typography.Text>
      <Button type="primary" onClick={() => setActiveTab(Tab.MARKETPLACE)}>
        Browse Agents
      </Button>
    </Flex>
  );
};
