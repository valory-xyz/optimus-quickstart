import { ServicesContext } from "@/context/ServicesProvider";
import { ServiceStatus } from "@/enums/ServiceStatus";
import ServicesService from "@/service/Services";
import { Service } from "@/types/Service";
import { useContext } from "react";

export const useServices = () => {
  const { services, setServices } = useContext(ServicesContext);

  const updateServices = async () =>
    await ServicesService.getServices().then((data: Service[]) =>
      setServices(data),
    );

  const updateServiceStatus = async (serviceHash: string, status: ServiceStatus) =>
    setServices((prev) =>
      prev.map((service) => {
        if (Object.keys(service)[0] === serviceHash) {
          let updateService = service;
          updateService[serviceHash].status = status;
          return updateService;
        }
        return service;
      }),
    );  

  const buildService = async (serviceHash: string) => {
    await updateServiceStatus(serviceHash, ServiceStatus.BUILDING);
    await ServicesService.buildService(serviceHash);
  }

  const startService = async (serviceHash: string) => {
    await updateServiceStatus(serviceHash, ServiceStatus.RUNNING);
    await ServicesService.startService(serviceHash);
  };

  const stopService = async (serviceHash: string) => {  
    await updateServiceStatus(serviceHash, ServiceStatus.STOPPED);
    await ServicesService.stopService(serviceHash);
  }

  return {
    services,
    updateServices,
    updateServiceStatus,
    buildService,
    startService,
    stopService,
  };
};
