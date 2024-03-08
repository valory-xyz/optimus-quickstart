import { ServiceTemplate } from '@/client/types';
import { serviceTemplates } from '@/constants';

export const useServiceTemplates = () => {
  const getServiceTemplates = (): ServiceTemplate[] => serviceTemplates;
  const getServiceTemplate = (hash: string): ServiceTemplate | undefined =>
    serviceTemplates.find((template) => template.hash === hash);

  return {
    getServiceTemplate,
    getServiceTemplates,
  };
};
