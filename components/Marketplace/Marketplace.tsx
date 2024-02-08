import { Flex } from "antd";
import { MarketplaceItemCard } from "./MarketplaceItemCard/MarketplaceItemCard";
import { MARKETPLACE_ITEMS } from "@/constants/marketplace";
import type { MarketplaceItem } from "@/types/MarketplaceItem";
import { useServices } from "@/hooks/useServices";

export const Marketplace = () => {
  const { services } = useServices();

  const marketPlaceItems = services.map((service) => ({
    marketplaceItem: MARKETPLACE_ITEMS[service.name],
    serviceHash: service.hash,
  }));

  return (
    <Flex vertical>
      {marketPlaceItems.map(
        ({
          marketplaceItem,
          serviceHash,
        }: {
          marketplaceItem: MarketplaceItem;
          serviceHash: string;
        }) => (
          <MarketplaceItemCard
            key={marketplaceItem.id}
            marketplaceItem={marketplaceItem}
            serviceHash={serviceHash}
            marginBottom={8}
          />
        ),
      )}
    </Flex>
  );
};
