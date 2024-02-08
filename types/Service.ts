export type Service = Record<
  string,
  {
    agent_id: number;
    hash: string;
    name: string;
    status?: "building" | "running" | "stopped";
  }
>;

/**
 * {
  "bafybeifhq2udyttnuidkc7nmtjcfzivbbnfcayixzps7fa5x3cg353bvfe": {
    "agent_id": 14, 
    "chain": "gnosis", 
    "cost_of_bond": 10000000000000000, 
    "name": "trader", 
    "nft": "bafybeig64atqaladigoc3ds4arltdu63wkdrk3gesjfvnfdmz35amv7faq", 
    "number_of_keys": 1, 
    "number_of_slots": 1, 
    "required_envs": [
      "rpc"
    ], 
    "required_funds": [
      0.1
    ], 
    "threshold": 1
  }
}

 */
