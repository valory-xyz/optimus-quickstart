import { useModals } from "@/hooks/useModals";
import { SettingOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import { useMemo } from "react";

export const SettingsButton = ({ disabled }: { disabled: boolean }) => {
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
    <Dropdown menu={{ items }} placement="bottomLeft" disabled={disabled}>
      <Button type="text" icon={<SettingOutlined />} />
    </Dropdown>
  );
};
