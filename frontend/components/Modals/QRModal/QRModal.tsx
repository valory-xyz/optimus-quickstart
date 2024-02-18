import { useModals } from "@/hooks";
import { QRModalData } from "@/types/QRModalData";
import { Flex, Modal, QRCode, Typography } from "antd";
import { ethers } from "ethers";
import { useMemo } from "react";

export const QRModal = ({
  data: { amount, chainId, address, open },
}: {
  data: QRModalData;
}) => {
  const { setQrModalData } = useModals();

  const handleCancel = () => {
    setQrModalData((prev: QRModalData) => ({
      ...prev,
      open: false,
      address: undefined,
      amount: undefined,
      chainId: undefined,
    }));
  };

  const parsedAmount = useMemo(
    () => amount && ethers.utils.parseEther(`${amount}`),
    [amount],
  );

  const qrCodeAddress = useMemo(
    () =>
      `https://metamask.app.link/send/${address}@${chainId}?value=${parsedAmount}`,
    [address, chainId, parsedAmount],
  );

  return (
    <Modal
      open={open}
      title="Scan QR code"
      footer={null}
      onCancel={handleCancel}
    >
      <Flex vertical gap={5}>
        <Typography.Text>
          This QR code is currently only supported by{" "}
          <strong>Metamask Mobile</strong>.
        </Typography.Text>
        <QRCode value={qrCodeAddress} style={{ margin: "auto 0" }} />
      </Flex>
    </Modal>
  );
};
