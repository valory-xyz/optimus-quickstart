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

  // Update service status
  useInterval(
    async () => {
      if (!services?.[0]) return;
      const serviceStatus = await ServicesService.getDeployment(
        services[0].hash,
      );
      setServiceStatus(serviceStatus.status);
    },
    services?.length ? 5000 : null,
  );

  // Update service state
  useInterval(
    () => updateServicesState().catch((e) => message.error(e.message)),
    hasInitialLoaded ? 5000 : null,
  );

  return (
    <ServicesContext.Provider
      value={{
        services,
        serviceAddresses,
        setServices,
        updateServicesState,
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
