import { Flex } from 'antd';
import { MarketplaceItemCard } from './MarketplaceItemCard';
import { useMemo } from 'react';
import { useServiceTemplates } from '@/hooks';

export const Marketplace = () => {
  const { getServiceTemplates } = useServiceTemplates();

  const serviceTemplates = useMemo(
    () => getServiceTemplates(),
    [getServiceTemplates],
  );

  return (
    <Flex vertical>
      {serviceTemplates.map((serviceTemplate) => (
        <MarketplaceItemCard
          key={serviceTemplate.hash}
          serviceTemplate={serviceTemplate}
        />
      ))}
    </Flex>
  );
};
