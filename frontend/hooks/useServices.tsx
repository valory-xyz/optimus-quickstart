import { Service, ServiceHash, ServiceTemplate } from "@/client";
import { ServicesContext } from "@/context";
import ServicesService from "@/service/Services";
import { message } from "antd";
import { useContext } from "react";

export const useServices = () => {
  const { services, updateServicesState, hasInitialLoaded } =
    useContext(ServicesContext);

  // SERVICES SERVICE METHODS
  const createService = async (serviceTemplate: Required<ServiceTemplate>) =>
    ServicesService.createService(serviceTemplate).catch(() => {
      message.error("Failed to create service");
    });

  const deployService = async (serviceHash: ServiceHash) =>
    ServicesService.deployService(serviceHash).catch(() => {
      message.error("Failed to deploy service");
    });

  const stopService = async (serviceHash: string) =>
    ServicesService.stopService(serviceHash).catch(() => {
      message.error("Failed to stop service");
    });

  const deleteServices = async (hashes: ServiceHash[]) =>
    ServicesService.deleteServices({ hashes }).catch(() => {
      message.error("Failed to delete services");
    });

  const getService = (serviceHash: ServiceHash) =>
    ServicesService.getService(serviceHash).catch(() =>
      message.error("Failed to get service"),
    );

  const getServiceStatus = (serviceHash: ServiceHash) =>
    ServicesService.getServiceStatus(serviceHash).catch(() =>
      message.error("Failed to get service status"),
    );

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
