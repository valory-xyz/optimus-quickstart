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
}>({
  rpcModalOpen: false,
  setRpcModalOpen: () => {},
  agentKeysModalOpen: false,
  setAgentKeysModalOpen: () => {},
});

export const ModalsProvider = ({ children }: PropsWithChildren) => {
  const [rpcModalOpen, setRpcModalOpen] = useState(false);
  const [agentKeysModalOpen, setAgentKeysModalOpen] = useState(false);
  return (
    <ModalsContext.Provider
      value={{
        rpcModalOpen,
        setRpcModalOpen,
        agentKeysModalOpen,
        setAgentKeysModalOpen,
      }}
    >
      <RPCModal />
      <AgentKeysModal />
      {children}
    </ModalsContext.Provider>
  );
};
