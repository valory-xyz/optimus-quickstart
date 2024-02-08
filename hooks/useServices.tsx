import { ServicesContext } from "@/context/ServicesProvider";
import ServicesService from "@/service/Services";
import { Service } from "@/types/Service";
import { useContext } from "react";

export const useServices = () => {
  const { services, setServices } = useContext(ServicesContext);

  const updateServices = async () =>
    await ServicesService.getServices().then((data: Service[]) =>
      setServices(data),
    );

  const updateServiceStatus = async (serviceHash: string, status: string) =>
    setServices((prev) =>
      prev.map((service) => {
        if (Object.keys(service)[0] === serviceHash) {
          let updateService = service;
          updateService[serviceHash].status = status;
          return updateService;
        }
        return service;
      }),
    );

  return {
    updateServices,
  };
};
