import { Flex } from 'antd';
import { MarketplaceItemCard } from './MarketplaceItemCard/MarketplaceItemCard';
import { useMemo } from 'react';
import { useMarketplace } from '@/hooks';

export const Marketplace = () => {
  const { getServiceTemplates } = useMarketplace();

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
