import { message } from 'antd';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
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
};

export const ServicesContext = createContext<ServicesContextProps>({
  services: [],
  serviceAddresses: [],
  setServices: () => {},
  serviceStatus: undefined,
  setServiceStatus: () => {},
  hasInitialLoaded: false,
  updateServicesState: async () => {},
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
          if (!data.length || !Array.isArray(data)) return;
          setServices(data);
        })
        .catch((e) => {
          message.error(e.message);
        }),
    [],
  );

  useEffect(() => {
    // Update on load
    updateServicesState().then(() => setHasInitialLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update service status
  useInterval(
    async () => {
      if (!services?.[0]) return;
      const serviceStatus = await ServicesService.getDeployment(
        services[0].hash,
      );
      setServiceStatus(serviceStatus.status);
    },
    services.length ? 5000 : null,
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
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
