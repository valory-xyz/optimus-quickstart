import { Service, ServiceTemplate } from '@/client';
import { SpawnScreen } from '@/enums';
import { useServices } from '@/hooks';
import { ServicesService } from '@/service';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Popconfirm, message } from 'antd';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

export const ServiceCardSettings = ({
  service,
  serviceTemplate,
  isRpcValid,
  isLoading,
}: {
  service: Service;
  serviceTemplate: ServiceTemplate;
  isRpcValid: boolean | undefined;
  isLoading: boolean;
}) => {
  const { deleteServiceState, checkServiceIsFunded } = useServices();
  const [isServiceFunded, setIsServiceFunded] = useState(true);

  const handleDelete = useCallback(() => {
    ServicesService.deleteServices({ hashes: [service.hash] })
      .then(() => {
        message.success('Service deleted successfully');
        deleteServiceState(service.hash);
      })
      .catch(() => message.error('Failed to delete service'));
  }, [deleteServiceState, service.hash]);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: '1',
        label: (
          <Link
            href={`/spawn/${service.hash}?screen=${SpawnScreen.AGENT_FUNDING}`}
          >
            Fund agent
          </Link>
        ),
        disabled: isServiceFunded,
      },
      {
        key: '2',
        label: (
          <Popconfirm
            title="Delete service"
            description={
              <>
                Are you sure you want to delete this service?
                <br />
                Your funds may be lost.
              </>
            }
            placement="leftBottom"
            arrow={false}
            onConfirm={handleDelete}
          >
            <Link href={'#'}>Delete this agent</Link>
          </Popconfirm>
        ),
        danger: true,
      },
    ],
    [handleDelete, isServiceFunded, service.hash],
  );

  useInterval(() => {
    isRpcValid &&
      checkServiceIsFunded(service, serviceTemplate).then(setIsServiceFunded);
  }, 3000);

  return (
    <Dropdown menu={{ items }} placement="bottomRight" disabled={isLoading}>
      <Button style={{ position: 'absolute', top: 0, right: 0 }} type="text">
        <SettingOutlined />
      </Button>
    </Dropdown>
  );
};
