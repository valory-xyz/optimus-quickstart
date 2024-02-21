import { useModals } from '@/hooks';
import { QRModalData } from '@/types';
import { Flex, Modal, QRCode, Typography } from 'antd';
import { ethers } from 'ethers';
import { useMemo } from 'react';

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

  const parsedAmount: string | undefined = useMemo(() => {
    if (Number(amount)) return ethers.utils.parseUnits(`${amount}`).toString();
  }, [amount]);

  const metamaskAddress: string | undefined = useMemo(() => {
    if (!address || !chainId || !parsedAmount) return '';
    if (isERC20) {
      return `https://metamask.app.link/send/token/${address}@${chainId}?value=${parsedAmount}`;
    }
    return `https://metamask.app.link/send/${address}@${chainId}?value=${parsedAmount}`;
  }, [address, chainId, isERC20, parsedAmount]);

  const modalParamsValid: boolean = useMemo(
    () => Boolean(address && chainId && parsedAmount),
    [address, chainId, parsedAmount],
  );

  return (
    <Modal
      open={open && modalParamsValid}
      footer={null}
      title="Scan QR code"
      onCancel={handleCancel}
    >
      <Flex vertical gap={5}>
        <Typography.Text>
          This QR code is currently only supported by{' '}
          <strong>Metamask Mobile</strong>.
        </Typography.Text>
        <Flex justify="center">
          <QRCode value={metamaskAddress} />
        </Flex>
      </Flex>
    </Modal>
  );
};
