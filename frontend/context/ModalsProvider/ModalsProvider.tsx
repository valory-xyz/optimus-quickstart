import { QRModalData } from "@/types/QRModalData";
import dynamic from "next/dynamic";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from "react";

const QRModal = dynamic(
  () =>
    import("../../components/Modals/QRModal/QRModal").then(
      (mod) => mod.QRModal,
    ),
  { ssr: false },
);

export const ModalsContext = createContext<{
  qrModalData: QRModalData;
  setQrModalData: Dispatch<SetStateAction<QRModalData>>;
}>({
  qrModalData: {
    open: false,
    address: undefined,
    amount: undefined,
    chainId: undefined,
  },
  setQrModalData: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [qrModalData, setQrModalData] = useState<{
    open: boolean;
    address?: string;
    amount?: number;
    chainId?: number;
  }>({
    open: false,
    address: undefined,
    amount: undefined,
    chainId: undefined,
  });
  return (
    <ModalsContext.Provider
      value={{
        qrModalData,
        setQrModalData,
      }}
    >
      <QRModal data={qrModalData} />
      {children}
    </ModalsContext.Provider>
  );
};
