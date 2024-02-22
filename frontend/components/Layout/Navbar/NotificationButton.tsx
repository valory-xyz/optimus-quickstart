import { BellOutlined } from '@ant-design/icons';
import { MenuProps, Dropdown, Button } from 'antd';

const items: MenuProps['items'] = [];

type NotificationButtonProps = {
  disabled?: boolean;
};

export const NotificationButton = ({ disabled }: NotificationButtonProps) => {
  return (
    <Dropdown menu={{ items }} placement="bottomLeft" disabled={disabled}>
      <Button type="text" icon={<BellOutlined />} />
    </Dropdown>
  );
};
