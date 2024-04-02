import { message } from 'antd';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useInterval } from 'usehooks-ts';

import { DeploymentStatus, Service } from '@/client';
import { ServicesService } from '@/service';

type ServicesContextProps = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
  serviceStatus: DeploymentStatus | undefined;
  setServiceStatus: Dispatch<SetStateAction<DeploymentStatus | undefined>>;
  updateServicesState: () => Promise<void>;
  hasInitialLoaded: boolean;
};

export const ServicesContext = createContext<ServicesContextProps>({
  services: [],
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

  const updateServicesState = useCallback(async (): Promise<void> => {
    try {
      return ServicesService.getServices().then((data: Service[]) => {
        setServices(data);
      });
    } catch (e) {
      Promise.reject(e);
    }
  }, []);

  useEffect(() => {
    // Update on load
    updateServicesState()
      .catch(() => {
        message.error('Initial services update failed.');
      })
      .then(() => setHasInitialLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update service status
  useInterval(async () => {
    if (services.length < 1) return;
    const serviceStatus = await ServicesService.getDeployment(services[0].hash);
    setServiceStatus(serviceStatus.status);
  }, 5000);

  // Update service state
  useInterval(
    () => updateServicesState().catch((e) => message.error(e.message)),
    hasInitialLoaded ? 5000 : null,
  );

  return (
    <ServicesContext.Provider
      value={{
        services,
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
