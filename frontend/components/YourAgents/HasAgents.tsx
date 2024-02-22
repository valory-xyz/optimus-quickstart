import { Service } from '@/client';
import { Flex } from 'antd';
import { ServiceCard } from './ServiceCard/ServiceCard';

export const HasAgents = ({
  services,
}: {
  services: Service[];
}): JSX.Element => {
  return (
    <Flex vertical gap={16}>
      {services.map((service: Service) => (
        <ServiceCard key={service.hash} service={service} />
      ))}
    </Flex>
  );
};
