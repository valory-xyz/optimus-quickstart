import { Action } from "./enums";
import {
  HttpResponse,
  ClientResponse,
  Deployment,
  EmptyPayload,
  StopDeployment,
  Service,
  EmptyResponse,
  Services,
  ServiceTemplate,
  UpdateServicePayload,
  DeleteServicesPayload,
  DeleteServicesResponse,
  AppInfo,
} from "./types";

export class HttpClient<
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
      const result = await fetch(this.endpoint, {
        method: method,
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await result.json();
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
      const result = await fetch(this.endpoint);
      const response = await result.json();
      return {
        error: undefined,
        data: response,
      };
    } catch {
      return {
        error: "Error connecting to server",
        data: undefined,
      };
    }
  }

  async post({
    data,
  }: {
    data: PostRequest;
  }): Promise<ClientResponse<PostResponse>> {
    const response = await this.request({
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
    const response = await this.request({
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
    const response = await this.request({
      data: JSON.stringify(data),
      method: "DELETE",
    });
    return response as ClientResponse<DeleteResponse>;
  }
}

export class DeploymentEndpoint extends HttpClient<
  Deployment,
  EmptyPayload,
  Deployment,
  EmptyPayload,
  Deployment,
  StopDeployment,
  Deployment
> {}

export class ServiceEndpoint extends HttpClient<
  Service,
  EmptyPayload,
  EmptyResponse,
  Service,
  Service,
  EmptyPayload,
  EmptyResponse
> {
  actions = {
    [Action.STATUS]: "status",
    [Action.BUILD]: "build",
    [Action.DEPLOY]: "deploy",
    [Action.STOP]: "stop",
  };

  constructor(endpoint: string) {
    super(endpoint);
  }

  deployment(action: Action) {
    return new DeploymentEndpoint(`${this.endpoint}/${this.actions[action]}`);
  }
}

export class ServicesEndpoint extends HttpClient<
  Services,
  ServiceTemplate,
  Service,
  UpdateServicePayload,
  Service,
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

export function getClient(url: string) {
  const api = new HttpClient<
    AppInfo,
    EmptyPayload,
    EmptyResponse,
    EmptyPayload,
    EmptyResponse,
    EmptyPayload,
    EmptyResponse
  >(url);
  const services = new ServicesEndpoint(`${url}/services`);
  return {
    url: url,
    api: api,
    services: services,
  };
}
