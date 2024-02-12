export type Service = {
  agent_id: number;
  built: boolean;
  chain: string;
  hash: string;
  name: string;
  running: boolean;
  earnings_24h?: number;
  total_balance?: number;
};
