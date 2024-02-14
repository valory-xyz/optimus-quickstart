export type Service = {
  agent_id: number;
  built: boolean;
  rpc?: string;
  chain: string;
  hash: string;
  name: string;
  running: boolean;
  earnings_24h?: number;
  total_balance?: number;
};
