import { ServiceMeta } from "@/types/ServiceMeta";

export const SERVICE_META = {
  trader: {
    id: "trader",
    name: "Prediction Agent",
    description:
      "Participates in prediction markets according to your strategy.",
    image_src: "/marketplace/prediction-agent.png",
  },
} as Record<string, ServiceMeta>;
