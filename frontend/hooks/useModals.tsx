import { ModalsContext } from "@/context";
import { QRModalData } from "@/types/QRModalData";
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
    });

  const qrModalOpen = (data: Omit<Required<QRModalData>, "open">) =>
    setQrModalData({ open: true, ...data });

  return { qrModalData, setQrModalData, qrModalReset, qrModalOpen };
};
