import { SpawnScreen } from '@/enums';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps } from 'antd';
import Link from 'next/link';
import { useMemo } from 'react';

export const ServiceCardSettings = ({
  serviceHash,
}: {
  serviceHash: string;
}) => {
  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: '1',
        label: (
          <Link
            href={`/spawn/${serviceHash}?screen=${SpawnScreen.AGENT_FUNDING}`}
          >
            Fund agent
          </Link>
        ),
      },
      { key: '2', label: <Link href="#">Delete Agent</Link>, danger: true },
    ],
    [serviceHash],
  );

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button style={{ position: 'absolute', top: 0, right: 0 }} type="text">
        <SettingOutlined />
      </Button>
    </Dropdown>
  );
};
