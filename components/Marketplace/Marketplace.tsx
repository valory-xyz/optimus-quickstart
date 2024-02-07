import { Flex } from "antd";
import { MarketplaceItemCard } from "./MarketplaceItemCard/MarketplaceItemCard";
import { MARKETPLACE_ITEMS } from "@/constants/marketplace";
import type { MarketplaceItem } from "@/types/MarketplaceItem";

export const Marketplace = () => {
  return (
    <Flex vertical>
      {MARKETPLACE_ITEMS.map((marketplaceItem: MarketplaceItem) => (
        <MarketplaceItemCard
          key={marketplaceItem.id}
          marketplaceItem={marketplaceItem}
          marginBottom={8}
        />
      ))}
    </Flex>
  );
};
