import {
  DeleteServicesResponse,
  Deployment,
  Service,
  ServiceHash,
  ServiceTemplate,
} from "@/client";
import { ServicesContext } from "@/context";
import ServicesService from "@/service/Services";
import { message } from "antd";
import { useContext } from "react";

export const useServices = () => {
  const { services, updateServicesState, hasInitialLoaded } =
    useContext(ServicesContext);

  // SERVICES SERVICE METHODS
  const createService = async (
    serviceTemplate: Required<ServiceTemplate>,
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

  const getServiceStatus = (serviceHash: ServiceHash): Promise<Deployment> =>
    ServicesService.getServiceStatus(serviceHash);

  // STATE METHODS
  const getServiceFromState = (
    serviceHash: ServiceHash,
  ): Service | undefined => {
    if (!hasInitialLoaded) {
      message.error("Services not loaded yet");
      return;
    }
    return services.find((service) => service.hash === serviceHash);
  };

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
    hasInitialLoaded,
  };
};
