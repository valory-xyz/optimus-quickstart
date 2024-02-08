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
        const _serviceHash = Object.keys(service)[0];
        if (_serviceHash === serviceHash) {
          return {_serviceHash: { ...service[_serviceHash], status };
        }
        return service;
      }),
    );

  return {
    updateServices,
  };
};
