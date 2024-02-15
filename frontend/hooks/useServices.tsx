import {
  DeleteServicesResponse,
  DeploymentType,
  Service,
  ServiceHash,
  ServiceTemplate,
} from "@/client";
import { ServicesContext } from "@/context";
import ServicesService from "@/service/Services";
import { useContext } from "react";

export const useServices = () => {
  const { services, updateServicesState } = useContext(ServicesContext);

  // SERVICES SERVICE METHODS
  const createService = async (
    serviceTemplate: ServiceTemplate,
  ): Promise<Service> => ServicesService.createService(serviceTemplate);

  const deployService = async (serviceHash: ServiceHash) =>
    ServicesService.deployService(serviceHash);

  const stopService = async (serviceHash: string) =>
    ServicesService.stopService(serviceHash);

  const deleteServices = async (
    hashes: ServiceHash[],
  ): Promise<DeleteServicesResponse> =>
    ServicesService.deleteServices({ hashes });

  const getService = (serviceHash: ServiceHash): Promise<Service> =>
    ServicesService.getService(serviceHash);

  const getServiceStatus = (
    serviceHash: ServiceHash,
  ): Promise<DeploymentType> => ServicesService.getServiceStatus(serviceHash);

  // STATE METHODS
  const getServiceFromState = (serviceHash: ServiceHash): Service | undefined =>
    services.find((service) => service.hash === serviceHash);

  return {
    services,
    getService,
    getServiceFromState,
    getServiceStatus,
    updateServicesState,
    createService,
    deployService,
    stopService,
    deleteServices,
  };
};
