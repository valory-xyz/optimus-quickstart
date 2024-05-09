import { message } from 'antd';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { DeploymentStatus, Service } from '@/client';
import { ServicesService } from '@/service';
import { Address } from '@/types';

type ServicesContextProps = {
  services: Service[];
  serviceAddresses: Address[];
  setServices: Dispatch<SetStateAction<Service[]>>;
  serviceStatus: DeploymentStatus | undefined;
  setServiceStatus: Dispatch<SetStateAction<DeploymentStatus | undefined>>;
  updateServicesState: () => Promise<void>;
  updateServiceStatus: () => Promise<void>;
  hasInitialLoaded: boolean;
  setHasInitialLoaded: Dispatch<SetStateAction<boolean>>;
};

export const ServicesContext = createContext<ServicesContextProps>({
  services: [],
  serviceAddresses: [],
  setServices: () => {},
  serviceStatus: undefined,
  setServiceStatus: () => {},
  updateServicesState: async () => {},
  updateServiceStatus: async () => {},
  hasInitialLoaded: false,
  setHasInitialLoaded: () => {},
});

export const ServicesProvider = ({ children }: PropsWithChildren) => {
  const [services, setServices] = useState<Service[]>([]);

  const [serviceStatus, setServiceStatus] = useState<
    DeploymentStatus | undefined
  >();
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  const serviceAddresses = useMemo(
    () =>
      services?.reduce<Address[]>((acc, service: Service) => {
        if (service.chain_data.instances) {
          acc.push(...service.chain_data.instances);
        }
        if (service.chain_data.multisig) {
          acc.push(service.chain_data.multisig);
        }
        return acc;
      }, []),
    [services],
  );

  const updateServicesState = useCallback(
    async (): Promise<void> =>
      ServicesService.getServices()
        .then((data: Service[]) => {
          if (!Array.isArray(data) || !data?.length) return;
          setServices(data);
          setHasInitialLoaded(true);
        })
        .catch((e) => {
          message.error(e.message);
        }),
    [],
  );

  const updateServiceStatus = useCallback(async () => {
    if (!services?.[0]) return;
    const serviceStatus = await ServicesService.getDeployment(services[0].hash);
    setServiceStatus(serviceStatus.status);
  }, [services]);

  // Update service state
  useInterval(
    () =>
      updateServicesState()
        .then(() => updateServiceStatus())
        .catch((e) => message.error(e.message)),
    5000,
  );

  return (
    <ServicesContext.Provider
      value={{
        services,
        serviceAddresses,
        setServices,
        updateServicesState,
        updateServiceStatus,
        hasInitialLoaded,
        serviceStatus,
        setServiceStatus,
        setHasInitialLoaded,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
