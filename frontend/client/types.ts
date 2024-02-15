import { Ledger, Chain, DeploymentStatus } from "./enums";

export type ServiceHash = string;

export type LedgerConfig = {
  rpc: string;
  type: Ledger;
  chain: Chain;
};

export type Key = {
  address: string;
  private_key: string;
  ledger: Chain;
};

export type Keys = Key[];

export type ChainData = {
  instances?: string[];
  token?: number;
  multisig?: string;
};

export type Service = {
  name: string;
  hash: string;
  keys: Keys;
  readme?: string;
  ledger?: LedgerConfig;
  chain_data?: ChainData;
};

export type Services = Service[];

export type ServiceTemplate = {
  rpc?: string;
  name: string;
  hash: string;
  image: string;
  description: string;
};

export type DeployedNodes = {
  agent: string[];
  tendermint: string[];
};

export type DeploymentType = {
  status: DeploymentStatus;
  nodes: DeployedNodes;
};

export type EmptyPayload = {};

export type EmptyResponse = {};

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
