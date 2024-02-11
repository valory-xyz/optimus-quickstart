import {
  createContext,
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  useState,
} from "react";

export const ModalsContext = createContext<{
  qrModalOpen: boolean;
  setQrModalOpen: Dispatch<SetStateAction<boolean>>;
}>({
  qrModalOpen: false,
  setQrModalOpen: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  return (
    <ModalsContext.Provider
      value={{
        qrModalOpen,
        setQrModalOpen,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
};
