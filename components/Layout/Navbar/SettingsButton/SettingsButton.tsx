import { useModals } from "@/hooks/useModals";
import { SettingOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import { useMemo } from "react";

export const SettingsButton = () => {
  const { setRpcModalOpen } = useModals();

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        key: "1",
        label: "RPCs",
        onClick: () => setRpcModalOpen(true),
      },
      {
        key: "2",
        label: "Agent Keys",
        disabled: true,
      },
    ],
    [setRpcModalOpen],
  );

  return (
    <Dropdown menu={{ items }} placement="bottomLeft">
      <Button type="text" icon={<SettingOutlined />} />
    </Dropdown>
  );
};
