import { Modal, QRCode } from "antd";

export const QRModal = ({ address }: { address: string }) => {
  return (
    <Modal
      title="Scan QR code"
      visible={true}
      footer={null}
      onCancel={() => {}}
    >
      <QRCode value={`ethereum:${address}`} />
    </Modal>
  );
};
