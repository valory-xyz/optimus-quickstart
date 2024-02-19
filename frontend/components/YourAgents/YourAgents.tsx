import { Tab } from "@/enums/Tabs";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex, Typography } from "antd";

import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "./ServiceCard/ServiceCard";
import { Service } from "@/client";
import { useMemo } from "react";

export const YourAgents = () => {
  const { getServicesFromState } = useServices();

  const services: Service[] = useMemo(
    () => getServicesFromState(),
    [getServicesFromState],
  );

  const hasAgents: boolean = useMemo(
    () =>
      services.reduce(
        (acc: boolean, service: Service) => (acc || service ? true : acc),
        false,
      ),
    [services],
  );

  return hasAgents ? <HasServices services={services} /> : <NoAgents />;
};

const HasServices = ({ services }: { services: Service[] }): JSX.Element => {
  return (
    <Flex vertical gap={16}>
      {services.map((service: Service) => (
        <ServiceCard key={service.hash} service={service} />
      ))}
    </Flex>
  );
};

const NoAgents = (): JSX.Element => {
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
