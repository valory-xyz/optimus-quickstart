import { Service } from '@/client';
import { Flex } from 'antd';
import { ServiceCard } from './ServiceCard/ServiceCard';
import { ReactElement } from 'react';

export const HasAgents = ({
  services,
}: {
  services: Service[];
}): ReactElement => {
  return (
    <Flex vertical gap={16}>
      {services.map((service: Service) => (
        <ServiceCard key={service.hash} service={service} />
      ))}
    </Flex>
  );
};
