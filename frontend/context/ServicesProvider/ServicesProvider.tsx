import { Services } from "@/client";
import ServicesService from "@/service/Services";
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
  services: Services;
  setServices: Dispatch<SetStateAction<Services>>;
  updateServicesState: () => Promise<void>;
};

export const ServicesContext = createContext<ServicesProviderProps>({
  services: [],
  setServices: () => {},
  updateServicesState: async () => {},
});

export const ServicesProvider = ({ children }: PropsWithChildren) => {
  const [services, setServices] = useState<Services>([]);

  const updateServicesState = useCallback(
    async () =>
      ServicesService.getServices()
        .then((data: Services) => {
          setServices(data);
        })
        .catch(() => {
          message.error("Failed to fetch services");
        }),
    [],
  );

  useEffect(() => {
    // Update on load
    updateServicesState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(updateServicesState, 5000);

  return (
    <ServicesContext.Provider
      value={{ services, setServices, updateServicesState }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
