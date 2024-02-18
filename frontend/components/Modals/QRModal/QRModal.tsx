import { ModalsContext } from "@/context";
import { Modal, QRCode } from "antd";
import { useContext } from "react";

export const QRModal = ({
  address,
  open,
}: {
  address: string;
  open: boolean;
}) => {
  const { setQrModalOpen, setQrModalAddress } = useContext(ModalsContext);

  const handleCancel = () => {
    setQrModalOpen(false);
    setQrModalAddress(undefined);
  };

  return (
    <Modal
      open={open}
      title="Scan QR code"
      footer={null}
      onCancel={handleCancel}
    >
      <QRCode value={`ethereum:${address}`} />
    </Modal>
  );
};
