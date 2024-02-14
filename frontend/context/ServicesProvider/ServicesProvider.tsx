import ServicesService from "@/service/Services";
import { Service } from "@/types/Service";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

type ServicesProviderProps = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
  updateServices: () => Promise<void>;
};

export const ServicesContext = createContext<ServicesProviderProps>({
  services: [],
  setServices: () => {},
  updateServices: async () => {},
});

export const ServicesProvider = ({ children }: PropsWithChildren) => {
  const [services, setServices] = useState<Service[]>([]);

  const updateServices = useCallback(
    async () =>
      ServicesService.getServices().then((data: Service[]) => {
        setServices(data);
      }),
    [],
  );

  useEffect(() => {
    updateServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ServicesContext.Provider value={{ services, setServices, updateServices }}>
      {children}
    </ServicesContext.Provider>
  );
};
