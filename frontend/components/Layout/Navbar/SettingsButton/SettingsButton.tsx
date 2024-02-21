import { SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps } from 'antd';
import { useMemo } from 'react';

export const SettingsButton = ({ disabled }: { disabled: boolean }) => {
  const items: MenuProps['items'] = useMemo(() => [], []);

  return (
    <Dropdown menu={{ items }} placement="bottomLeft" disabled={disabled}>
      <Button type="text" icon={<SettingOutlined />} />
    </Dropdown>
  );
};
