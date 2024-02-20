import { ModalsContext } from "@/context";
import { QRModalData } from "@/types";
import { useContext } from "react";

export const useModals = () => {
  const { qrModalData, setQrModalData } = useContext(ModalsContext);

  //  QR MODALS

  const qrModalReset = () =>
    setQrModalData({
      open: false,
      address: undefined,
      amount: undefined,
      chainId: undefined,
      isERC20: false,
    });

  const qrModalOpen = (data: Omit<Required<QRModalData>, "open">) =>
    setQrModalData({ ...data, open: true });

  return { qrModalData, setQrModalData, qrModalReset, qrModalOpen };
};
