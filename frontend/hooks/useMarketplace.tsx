import { ServiceTemplate } from "@/client";
import { serviceTemplates } from "@/constants/serviceTemplates";

export const useMarketplace = () => {
  const getServiceTemplates = (): ServiceTemplate[] => serviceTemplates;
  const getServiceTemplate = (hash: string): ServiceTemplate | undefined =>
    serviceTemplates.find((template) => template.hash === hash);

  return {
    getServiceTemplate,
    getServiceTemplates,
  };
};
