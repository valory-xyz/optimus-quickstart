import { SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps } from 'antd';

const items: MenuProps['items'] = []; //placeholder for now

type SettingsButtonProps = {
  disabled: boolean;
};

export const SettingsButton = ({ disabled }: SettingsButtonProps) => {
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" disabled={disabled}>
      <Button type="text" icon={<SettingOutlined />} />
    </Dropdown>
  );
};
