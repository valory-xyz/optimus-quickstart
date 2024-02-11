export type Service = {
  agent_id: number;
  chain: string;
  hash: string;
  name: string;
  running: boolean;
  earnings_24h?: number;
  total_balance?: number;
};
