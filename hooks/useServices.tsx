import { ServicesContext } from "@/context/ServicesProvider";
import { ServiceStatus } from "@/enums/ServiceStatus";
import ServicesService from "@/service/Services";
import { Service } from "@/types/Service";
import { useContext } from "react";

export const useServices = () => {
  const { services, setServices } = useContext(ServicesContext);

  const updateServices = async () =>
    await ServicesService.getServices().then((data: Service[]) => {
      setServices(data);
    });

  const updateServiceStatus = (serviceHash: string, status: ServiceStatus) =>
    setServices((prev) =>
      prev.map((service) => {
        if (service.hash === serviceHash) {
          return { ...service, status };
        }
        return service;
      }),
    );

  const buildService = async (serviceHash: string) => {
    updateServiceStatus(serviceHash, ServiceStatus.BUILDING);
    return ServicesService.buildService(serviceHash);
  };

  const startService = async (serviceHash: string) => {
    updateServiceStatus(serviceHash, ServiceStatus.RUNNING);
    return ServicesService.startService(serviceHash);
  };

  const stopService = async (serviceHash: string) => {
    updateServiceStatus(serviceHash, ServiceStatus.STOPPED);
    return ServicesService.stopService(serviceHash);
  };

  return {
    services,
    updateServices,
    updateServiceStatus,
    buildService,
    startService,
    stopService,
  };
};
