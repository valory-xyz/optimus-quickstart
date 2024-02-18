import { useModals } from "@/hooks";
import { QRModalData } from "@/types/QRModalData";
import { Flex, Modal, QRCode, Typography } from "antd";
import { ethers } from "ethers";
import { useMemo } from "react";

export const QRModal = ({
  data: { amount, chainId, address, open, isERC20 },
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

  const metamaskAddress = useMemo(() => {
    if (!address || !chainId || !parsedAmount) return "";
    if (isERC20) {
      return `https://metamask.app.link/send/token/${address}@${chainId}?value=${parsedAmount}`;
    }
    return `https://metamask.app.link/send/${address}@${chainId}?value=${parsedAmount}`;
  }, [address, chainId, isERC20, parsedAmount]);

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
        <Flex justify="center">
          <QRCode value={metamaskAddress} />
        </Flex>
      </Flex>
    </Modal>
  );
};
