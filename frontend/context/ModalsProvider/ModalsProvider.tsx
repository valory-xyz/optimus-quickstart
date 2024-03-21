import { QRModalData } from '@/types';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';

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
    isErc20: false,
  },
  setQrModalData: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [qrModalData, setQrModalData] = useState<QRModalData>({
    open: false,
    address: undefined,
    amount: undefined,
    chainId: undefined,
    isErc20: false,
  });
  return (
    <ModalsContext.Provider
      value={{
        qrModalData,
        setQrModalData,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
};
