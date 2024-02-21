import { useModals } from '@/hooks';
import { QRModalData } from '@/types';
import { Flex, Modal, QRCode, Typography } from 'antd';
import { ethers } from 'ethers';
import { useMemo } from 'react';

type QRModalProps = {
  data: QRModalData;
};

export const QRModal = ({
  data: { amount, chainId, address, open, isERC20 },
}: QRModalProps) => {
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

  const metamaskUrl: string = useMemo(() => {
    if (!address || !chainId || !parsedAmount) return '';
    if (isERC20) {
      return `https://metamask.app.link/send/token/${address}@${chainId}?value=${parsedAmount}`;
    }
    return `https://metamask.app.link/send/${address}@${chainId}?value=${parsedAmount}`;
  }, [address, chainId, isERC20, parsedAmount]);

  const isModalParamsValid: boolean = useMemo(
    () => Boolean(address && chainId && parsedAmount),
    [address, chainId, parsedAmount],
  );

  return (
    <Modal
      open={open && isModalParamsValid}
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
          <QRCode value={metamaskUrl} />
        </Flex>
      </Flex>
    </Modal>
  );
};
