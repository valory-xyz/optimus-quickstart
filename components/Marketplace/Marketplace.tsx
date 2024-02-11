import { Flex } from "antd";
import { MarketplaceItemCard } from "./MarketplaceItemCard/MarketplaceItemCard";
import { useServices } from "@/hooks/useServices";
import { SERVICE_META } from "@/constants/serviceMeta";
import { useMemo } from "react";
import { ServiceMeta } from "@/types/ServiceMeta";
import { Service } from "@/types/Service";

export const Marketplace = () => {
  const { services } = useServices();

  const marketPlaceItems = useMemo(
    () =>
      services.map((service) => ({
        serviceMeta: SERVICE_META[service.name],
        service,
      })),
    [services],
  );

  return (
    <Flex vertical>
      {marketPlaceItems.map(
        ({
          serviceMeta,
          service,
        }: {
          serviceMeta: ServiceMeta;
          service: Service;
        }) => (
          <MarketplaceItemCard
            key={serviceMeta.id}
            serviceMeta={serviceMeta}
            service={service}
            marginBottom={8}
          />
        ),
      )}
    </Flex>
  );
};
