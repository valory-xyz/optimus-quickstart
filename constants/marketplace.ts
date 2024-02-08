import { MarketplaceItem } from "@/types/MarketplaceItem";

export const MARKETPLACE_ITEMS = {
  trader: {
    id: "trader",
    name: "Prediction Agent",
    description:
      "Participates in prediction markets according to your strategy.",
    image_src: "/marketplace/prediction-agent.png",
  },
} as Record<string, MarketplaceItem>;
