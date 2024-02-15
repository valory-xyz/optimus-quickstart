type ServiceHash = string;

enum Action {
  STATUS = 0,
  BUILD = 1,
  DEPLOY = 2,
  STOP = 3,
}

enum ChainType {
  ETHEREUM = 0,
  GOERLI = 1,
  GNOSIS = 2,
  SOLANA = 3,
}

enum LedgerType {
  ETHEREUM = 0,
  SOLANA = 1,
}

type LedgerConfig = {
  rpc: string;
  type: LedgerType;
  chain: ChainType;
};

type Key = {
  address: string;
  private_key: string;
  ledger: ChainType;
};

type KeysType = Key[];

type ChainData = {
  instances?: string[];
  token?: number;
  multisig?: string;
};

type ServiceType = {
  name: string;
  hash: string;
  keys: KeysType;
  readme?: string;
  ledger?: LedgerConfig;
  chain_data?: ChainData;
};

type ServicesType = ServiceType[];

type ServiceTemplate = {
  rpc: string;
  name: string;
  hash: string;
  image: string;
  description: string;
};

enum Status {
  CREATED = 0,
  BUILT = 1,
  DEPLOYING = 2,
  DEPLOYED = 3,
  STOPPING = 4,
  STOPPED = 5,
  DELETED = 6,
}

type DeployedNodes = {
  agent: string[];
  tendermint: string[];
};

type DeploymentType = {
  status: Status;
  nodes: DeployedNodes;
};

type EmptyPayload = {};

type EmptyResponse = {};

type HttpResponse = {
  error?: string;
  data?: string;
};

type ClientResponse<ResponseType> = {
  error?: string;
  data?: ResponseType;
};

class HttpClient<
  GetResponse,
  PostRequest,
  PostResponse,
  PutRequest,
  PutResponse,
  DeleteRequest,
  DeleteResponse,
> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async request({
    data,
    method,
  }: {
    data: string;
    method: string;
  }): Promise<HttpResponse> {
    try {
      let result = await fetch(this.endpoint, {
        method: method,
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      let response = await result.json();
      if (response.error) {
        return {
          error: response.error,
          data: undefined,
        };
      }
      return {
        error: undefined,
        data: response,
      };
    } catch (err) {
      return {
        error: String(err),
        data: undefined,
      };
    }
  }

  async get(): Promise<ClientResponse<GetResponse>> {
    try {
      let result = await fetch(this.endpoint);
      let response = await result.json();
      return {
        error: undefined,
        data: response,
      };
    } catch {
      return {
        error: "Error connecting to studio server",
        data: undefined,
      };
    }
  }

  async post({
    data,
  }: {
    data: PostRequest;
  }): Promise<ClientResponse<PostResponse>> {
    let response = await this.request({
      data: JSON.stringify(data),
      method: "POST",
    });
    return response as ClientResponse<PostResponse>;
  }

  async put({
    data,
  }: {
    data: PutRequest;
  }): Promise<ClientResponse<PutResponse>> {
    let response = await this.request({
      data: JSON.stringify(data),
      method: "PUT",
    });
    return response as ClientResponse<PutResponse>;
  }

  async delete({
    data,
  }: {
    data: DeleteRequest;
  }): Promise<ClientResponse<DeleteResponse>> {
    let response = await this.request({
      data: JSON.stringify(data),
      method: "DELETE",
    });
    return response as ClientResponse<DeleteResponse>;
  }
}

type StopDeployment = {
  delete: boolean /* Delete deployment*/;
};

class DeploymentEndpoint extends HttpClient<
  DeploymentType,
  EmptyPayload,
  DeploymentType,
  EmptyPayload,
  DeploymentType,
  StopDeployment,
  DeploymentType
> {}

class ServiceEndpoint extends HttpClient<
  ServiceType,
  EmptyPayload,
  EmptyResponse,
  ServiceType,
  ServiceType,
  EmptyPayload,
  EmptyResponse
> {
  actions = {
    0: "status",
    1: "build",
    2: "deploy",
    3: "stop",
  };

  constructor(endpoint: string) {
    super(endpoint);
  }

  deployment(action: Action) {
    return new DeploymentEndpoint(`${this.endpoint}/${this.actions[action]}`);
  }
}

type UpdateServicePayload = {
  old: ServiceHash;
  new: ServiceTemplate;
};

type DeleteServicesPayload = {
  hashes: Array<ServiceHash>;
};

type DeleteServicesResponse = {
  hashes: Array<ServiceHash>;
};

class ServicesEndpoint extends HttpClient<
  ServicesType,
  ServiceTemplate,
  ServiceType,
  UpdateServicePayload,
  ServiceType,
  DeleteServicesPayload,
  DeleteServicesResponse
> {
  constructor(endpoint: string) {
    super(endpoint);
  }

  service(hash: string): ServiceEndpoint {
    return new ServiceEndpoint(`${this.endpoint}/${hash}`);
  }
}

function getClient(url: string) {
  const services = new ServicesEndpoint(`${url}/services`);
  return {
    url: url,
    services: services,
  };
}

export { getClient, Action };
