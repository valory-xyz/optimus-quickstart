import { Address } from '@/types/Address';
import { Ledger, Chain, DeploymentStatus } from './enums';

export type ServiceHash = string;

export type LedgerConfig = {
  rpc: string;
  type: Ledger;
  chain: Chain;
};

export type ServiceKeys = {
  address: Address;
  private_key: string;
  ledger: Chain;
};

export type ChainData = {
  instances?: Address[];
  token?: number;
  multisig?: Address;
};

export type Service = {
  name: string;
  hash: string;
  keys: ServiceKeys;
  readme?: string;
  ledger: LedgerConfig;
  chain_data: ChainData;
  active: boolean;
};

export type ServiceTemplate = {
  name: string;
  hash: string;
  image: string;
  description: string;
  configuration: ConfigurationTemplate;
};

export type ConfigurationTemplate = {
  nft: string;
  rpc?: string; // added by user
  agent_id: number;
  threshold: number;
  use_staking: boolean;
  cost_of_bond: number;
  olas_cost_of_bond: number;
  olas_required_to_stake: number;
  fund_requirements: FundRequirementsTemplate;
};

export type FundRequirementsTemplate = {
  agent: number;
  safe: number;
};

export type DeployedNodes = {
  agent: string[];
  tendermint: string[];
};

export type Deployment = {
  status: DeploymentStatus;
  nodes: DeployedNodes;
};

export type EmptyPayload = Record<string, never>;

export type EmptyResponse = Record<string, never>;

export type HttpResponse = {
  error?: string;
  data?: string;
};

export type ClientResponse<ResponseType> = {
  error?: string;
  data?: ResponseType;
};

export type StopDeployment = {
  delete: boolean /* Delete deployment*/;
};

export type UpdateServicePayload = {
  old: ServiceHash;
  new: ServiceTemplate;
};

export type DeleteServicesPayload = {
  hashes: Array<ServiceHash>;
};

export type DeleteServicesResponse = {
  hashes: Array<ServiceHash>;
};

export type AppInfo = {
  account: {
    key: Address;
  };
};
