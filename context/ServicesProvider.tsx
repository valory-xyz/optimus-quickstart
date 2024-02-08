import { Service } from "@/types/Service";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
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
  return (
    <ServicesContext.Provider value={{ services, setServices }}>
      {children}
    </ServicesContext.Provider>
  );
};
