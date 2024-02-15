import { ServiceHash } from "@/client";

type ServiceTemplate = {
  name: string;
  description: string;
  hash: ServiceHash;
  image: string;
  rpc: string | undefined;
};

export const serviceTemplates: ServiceTemplate[] = [
  {
    name: "Trader Agent",
    description: "Trader agent for omen prediction markets",
    hash: "bafybeigiwlvm6ey4dmlztg3z4xyvpol23n444vliivx2ybuki7xo4f3pae",
    image:
      "https://operate.olas.network/_next/image?url=%2Fimages%2Fprediction-agent.png&w=3840&q=75",
    rpc: undefined,
  },
];
