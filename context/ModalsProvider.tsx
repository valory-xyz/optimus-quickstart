import { AgentKeysModal } from "@/components/Modals/AgentKeysModal/AgentKeysModal";
import { RPCModal } from "@/components/Modals/RPCModal/RPCModal";
import {
  createContext,
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  useState,
} from "react";

export const ModalsContext = createContext<{
  rpcModalOpen: boolean;
  setRpcModalOpen: Dispatch<SetStateAction<boolean>>;
  agentKeysModalOpen: boolean;
  setAgentKeysModalOpen: Dispatch<SetStateAction<boolean>>;
  qrModalOpen: boolean;
  setQrModalOpen: Dispatch<SetStateAction<boolean>>;
}>({
  rpcModalOpen: false,
  setRpcModalOpen: () => {},
  agentKeysModalOpen: false,
  setAgentKeysModalOpen: () => {},
  qrModalOpen: false,
  setQrModalOpen: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [rpcModalOpen, setRpcModalOpen] = useState(false);
  const [agentKeysModalOpen, setAgentKeysModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  return (
    <ModalsContext.Provider
      value={{
        rpcModalOpen,
        setRpcModalOpen,
        agentKeysModalOpen,
        setAgentKeysModalOpen,
        qrModalOpen,
        setQrModalOpen,
      }}
    >
      <RPCModal />
      <AgentKeysModal />
      {children}
    </ModalsContext.Provider>
  );
};
