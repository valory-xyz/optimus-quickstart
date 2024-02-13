import { ServicesContext } from "@/context";
import ServicesService from "@/service/Services";
import { BuildServiceResponse } from "@/types/BuildServiceResponse";
import { Service } from "@/types/Service";
import { useContext } from "react";

export const useServices = () => {
  const { services, updateServices } = useContext(ServicesContext);

  /**
   * Build a service
   * @param serviceHash string
   * @param rpc string
   * @returns Promise<BuildServiceResponse>
   */
  const buildService = async (
    serviceHash: string,
    rpc: string,
  ): Promise<BuildServiceResponse> => {
    return ServicesService.buildService(serviceHash, rpc);
  };

  const startService = async (serviceHash: string) => {
    return ServicesService.startService(serviceHash);
  };

  const stopService = async (serviceHash: string) => {
    return ServicesService.stopService(serviceHash);
  };

  const deleteService = async (serviceHash: string) => {
    return ServicesService.deleteService(serviceHash);
  };

  const getService = (serviceHash: string): Service =>
    services.find((s) => s.hash === serviceHash) as Service;

  return {
    services,
    getService,
    updateServices,
    buildService,
    startService,
    stopService,
    deleteService,
  };
};
