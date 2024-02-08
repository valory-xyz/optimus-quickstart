import { Agent } from "@/types/Agent";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from "react";

type AgentContextType = {
  agents: any[];
  setAgents: Dispatch<SetStateAction<Agent[]>>;
};

export const AgentsContext = createContext<AgentContextType>({
  agents: [],
  setAgents: () => {},
});

export const AgentsProvider = ({ children }: PropsWithChildren) => {
  const [agents, setAgents] = useState<Agent[]>([]);

  return (
    <AgentsContext.Provider value={{ agents, setAgents }}>
      {children}
    </AgentsContext.Provider>
  );
};
