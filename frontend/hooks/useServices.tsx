import { Service, ServiceHash, ServiceTemplate } from "@/client";
import { ServicesContext } from "@/context";
import ServicesService from "@/service/Services";
import { useContext } from "react";

export const useServices = () => {
  const { services, updateServicesState, hasInitialLoaded } =
    useContext(ServicesContext);

  // SERVICES SERVICE METHODS
  const createService = async (serviceTemplate: Required<ServiceTemplate>) =>
    ServicesService.createService(serviceTemplate);

  const deployService = async (serviceHash: ServiceHash) =>
    ServicesService.deployService(serviceHash);

  const stopService = async (serviceHash: string) =>
    ServicesService.stopService(serviceHash);

  const deleteServices = async (hashes: ServiceHash[]) =>
    ServicesService.deleteServices({ hashes });

  const getService = (serviceHash: ServiceHash) =>
    ServicesService.getService(serviceHash);

  const getServiceStatus = (serviceHash: ServiceHash) =>
    ServicesService.getServiceStatus(serviceHash);

  // STATE METHODS
  const getServiceFromState = (
    serviceHash: ServiceHash,
  ): Service | undefined => {
    if (!hasInitialLoaded) {
      return undefined;
    }
    return services.find((service) => service.hash === serviceHash);
  };

  const getServicesFromState = (): Service[] =>
    hasInitialLoaded ? services : [];

  return {
    getService,
    getServiceFromState,
    getServicesFromState,
    getServiceStatus,
    updateServicesState,
    createService,
    deployService,
    stopService,
    deleteServices,
    hasInitialLoaded,
  };
};
