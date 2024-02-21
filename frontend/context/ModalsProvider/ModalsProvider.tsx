import { QRModalData } from '@/types';
import dynamic from 'next/dynamic';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';

const QRModal = dynamic(
  () => import('../../components/Modals/QRModal').then((mod) => mod.QRModal),
  { ssr: false },
);

type ModalsContextProps = {
  qrModalData: QRModalData;
  setQrModalData: Dispatch<SetStateAction<QRModalData>>;
};

export const ModalsContext = createContext<ModalsContextProps>({
  qrModalData: {
    open: false,
    address: undefined,
    amount: undefined,
    chainId: undefined,
    isERC20: false,
  },
  setQrModalData: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [qrModalData, setQrModalData] = useState<QRModalData>({
    open: false,
    address: undefined,
    amount: undefined,
    chainId: undefined,
    isERC20: false,
  });
  return (
    <ModalsContext.Provider
      value={{
        qrModalData,
        setQrModalData,
      }}
    >
      {qrModalData.open && <QRModal data={qrModalData} />}
      {children}
    </ModalsContext.Provider>
  );
};
