import { AgentStatus } from "@/enums/AgentStatus";

export type Agent = {
  id: number;
  serviceHash: string;
  description: string;
  name: string;
  status: AgentStatus;
  earnings_24h: number;
  total_balance: number;
  image_src: string;
};
