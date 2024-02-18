import { ServiceTemplate } from "@/client";
import { serviceTemplates } from "@/constants/serviceTemplates";

export const useMarketplace = () => {
  const getServiceTemplates = (): ServiceTemplate[] => serviceTemplates;
  const getServiceTemplate = (hash: string): ServiceTemplate =>
    serviceTemplates.find(
      (template) => template.hash === hash,
    ) as ServiceTemplate;

  return {
    getServiceTemplate,
    getServiceTemplates,
  };
};
