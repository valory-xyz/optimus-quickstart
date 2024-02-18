import dynamic from "next/dynamic";
import {
  createContext,
  Dispatch,
  SetStateAction,
  PropsWithChildren,
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
  qrModalOpen: boolean;
  setQrModalOpen: Dispatch<SetStateAction<boolean>>;
  setQrModalAddress: Dispatch<SetStateAction<string | undefined>>;
}>({
  qrModalOpen: false,
  setQrModalOpen: () => {},
  setQrModalAddress: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalAddress, setQrModalAddress] = useState<string | undefined>();
  return (
    <ModalsContext.Provider
      value={{
        qrModalOpen,
        setQrModalOpen,
        setQrModalAddress,
      }}
    >
      {qrModalAddress && (
        <QRModal address={qrModalAddress} open={qrModalOpen} />
      )}
      {children}
    </ModalsContext.Provider>
  );
};
