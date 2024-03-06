import { Service, ServiceHash } from '@/client';
import { ServicesContext } from '@/context';
import { ServicesService } from '@/service';
import { useContext } from 'react';

export const useServices = () => {
  const { services, updateServicesState, hasInitialLoaded, setServices } =
    useContext(ServicesContext);

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
    ServicesService.getService(serviceHash).then((service: Service) =>
      setServices((prev) => {
        const index = prev.findIndex((s) => s.hash === serviceHash); // findIndex returns -1 if not found
        if (index === -1) return [...prev, service];
        const newServices = [...prev];
        newServices[index] = service;
        return newServices;
      }),
    );

  const deleteServiceState = (serviceHash: ServiceHash) =>
    setServices((prev) => prev.filter((s) => s.hash !== serviceHash));

  return {
    getServiceFromState,
    getServicesFromState,
    updateServicesState,
    updateServiceState,
    deleteServiceState,
    hasInitialLoaded,
  };
};
