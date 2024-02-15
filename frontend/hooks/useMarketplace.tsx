import { serviceTemplates } from "@/constants/serviceTemplates";

export const useMarketplace = () => {
  const getServiceTemplates = () => serviceTemplates;
  const getServiceTemplate = (hash: string) =>
    serviceTemplates.find((template) => template.hash === hash);

  return {
    getServiceTemplate,
    getServiceTemplates,
  };
};
