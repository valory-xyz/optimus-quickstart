import { message } from 'antd';
import { isAddress } from 'ethers/lib/utils';
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
      services.flatMap(({ chain_data: { instances = [], multisig } }) => {
        const validInstances = instances.filter((instance) =>
          isAddress(`${instance}`),
        );
        if (!multisig) return validInstances;
        return isAddress(`${multisig}`)
          ? [...validInstances, multisig]
          : validInstances;
      }) ?? [],
    [services],
  );

  const updateServicesState = useCallback(
    async (): Promise<void> =>
      ServicesService.getServices().then((data: Service[]) =>
        setServices(data),
      ),
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
