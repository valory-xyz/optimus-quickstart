import {
  DeleteServicesPayload,
  DeleteServicesResponse,
  DeploymentType,
  Service,
  ServiceHash,
  ServiceTemplate,
  Services,
} from "@/client";
import { BACKEND_URL } from "@/constants/urls";

/**
 * Get the status of a service
 * @param serviceHash
 * @returns
 */
const getServiceStatus = async (
  serviceHash: ServiceHash,
): Promise<DeploymentType> => {
  return fetch(`${BACKEND_URL}/services/${serviceHash}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
};

/**
 * Get a single service from the backend
 * @param serviceHash
 * @returns
 */
const getService = async (serviceHash: ServiceHash): Promise<Service> =>
  fetch(`${BACKEND_URL}/services/${serviceHash}`).then((response) =>
    response.json(),
  );

/**
 * Gets an array of services from the backend
 * @returns An array of services
 */
const getServices = async (): Promise<Services> =>
  fetch(`${BACKEND_URL}/services`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());

/**
 * Deploys a service to the backend
 * @param payload
 * @returns
 */
const deployService = async (
  serviceHash: ServiceHash,
): Promise<DeleteServicesResponse> =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());

/**
 * Deletes services from the backend
 * @param payload An array of service hashes to delete
 * @returns An array of deleted service hashes
 */
const deleteServices = async (
  payload: DeleteServicesPayload,
): Promise<DeleteServicesResponse> =>
  fetch(`${BACKEND_URL}/services`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  }).then((response) => response.json());

/**
 * Creates a service
 */
const createService = async (
  serviceTemplate: Required<ServiceTemplate>,
): Promise<Service> =>
  fetch(`${BACKEND_URL}/services`, {
    method: "POST",
    body: JSON.stringify(serviceTemplate),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());

/**
 * Stops a service
 * @param serviceHash
 * @returns
 */
const stopService = async (serviceHash: ServiceHash): Promise<DeploymentType> =>
  fetch(`${BACKEND_URL}/services/${serviceHash}/stop`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => data);

const ServicesService = {
  getService,
  getServices,
  getServiceStatus,
  deleteServices,
  stopService,
  deployService,
  createService,
};

export default ServicesService;
