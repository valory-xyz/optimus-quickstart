import { Service, ServiceHash, ServiceTemplate } from '@/client';
import { ServicesContext } from '@/context';
import { ServicesService } from '@/service';
import { useContext } from 'react';

export const useServices = () => {
  const { services, updateServicesState, hasInitialLoaded, setServices } =
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

  const getService = async (serviceHash: ServiceHash) =>
    ServicesService.getService(serviceHash);

  const getServiceStatus = async (serviceHash: ServiceHash) =>
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

  const updateServiceState = (serviceHash: ServiceHash) =>
    getService(serviceHash).then((service: Service) =>
      setServices((prev) => {
        const index = prev.findIndex((s) => s.hash === serviceHash); // findIndex returns -1 if not found
        if (index === -1) throw new Error('Service not found');
        const newServices = [...prev];
        newServices[index] = service;
        return newServices;
      }),
    );

  const deleteServiceState = (serviceHash: ServiceHash) =>
    setServices((prev) => prev.filter((s) => s.hash !== serviceHash));

  return {
    getService,
    getServiceFromState,
    getServicesFromState,
    getServiceStatus,
    updateServicesState,
    updateServiceState,
    deleteServiceState,
    createService,
    deployService,
    stopService,
    deleteServices,
    hasInitialLoaded,
  };
};
