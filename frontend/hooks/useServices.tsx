import { Service, ServiceHash, ServiceTemplate } from '@/client';
import { ServicesContext } from '@/context';
import { ServicesService } from '@/service';
import MulticallService from '@/service/Multicall';
import { Address, AddressBooleanRecord } from '@/types';
import { useContext } from 'react';

const checkServiceIsFunded = async (
  service: Service,
  serviceTemplate: ServiceTemplate,
): Promise<boolean> => {
  const {
    chain_data: { instances, multisig },
  } = service;

  if (!instances || !multisig) return Promise.resolve(false);

  const addresses = [...instances, multisig];

  const balances = await MulticallService.getEthBalances(
    addresses,
    service.ledger.rpc,
  );

  if (!balances) return Promise.resolve(false);

  const fundRequirements: AddressBooleanRecord = addresses.reduce(
    (acc: AddressBooleanRecord, address: Address) => ({
      ...acc,
      [address]: instances.includes(address)
        ? balances[address] >
          serviceTemplate.configuration.fund_requirements.agent
        : balances[address] >
          serviceTemplate.configuration.fund_requirements.safe,
    }),
    {},
  );

  return Promise.resolve(Object.values(fundRequirements).every((f) => f));
};

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
    checkServiceIsFunded,
    updateServicesState,
    updateServiceState,
    deleteServiceState,
    hasInitialLoaded,
  };
};
