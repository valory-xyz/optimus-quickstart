import { Service } from "@/client";
import { ServicesService } from "@/service";
import { message } from "antd";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useInterval } from "usehooks-ts";

type ServicesProviderProps = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
  updateServicesState: () => Promise<void>;
  hasInitialLoaded: boolean;
};

export const ServicesContext = createContext<ServicesProviderProps>({
  services: [],
  setServices: () => {},
  updateServicesState: async () => {},
  hasInitialLoaded: false,
});

export const ServicesProvider = ({ children }: PropsWithChildren) => {
  const [services, setServices] = useState<Service[]>([]);
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
        message.error("Inital services update failed.");
      })
      .then(() => setHasInitialLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(
    () => updateServicesState().catch((e) => message.error(e.message)),
    hasInitialLoaded ? 5000 : null,
  );

  return (
    <ServicesContext.Provider
      value={{ services, setServices, updateServicesState, hasInitialLoaded }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
