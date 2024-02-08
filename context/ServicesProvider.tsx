import ServicesService from "@/service/Services";
import { Service } from "@/types/Service";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

type ServicesProviderProps = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
};

export const ServicesContext = createContext<ServicesProviderProps>({
  services: [],
  setServices: () => {},
});

export const ServicesProvider = ({ children }: PropsWithChildren) => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Fetch services from API
    ServicesService.getServices().then((data: Service[]) => {
      setServices(data);
    });
  }, []);

  return (
    <ServicesContext.Provider value={{ services, setServices }}>
      {children}
    </ServicesContext.Provider>
  );
};
