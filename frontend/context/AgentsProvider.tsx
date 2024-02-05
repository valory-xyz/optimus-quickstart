import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from "react";

type AgentContextType = {
  agents: any[];
  setAgents: Dispatch<SetStateAction<any[]>>;
};

export const AgentsContext = createContext<AgentContextType>({
  agents: [],
  setAgents: () => {},
});

export const AgentsProvider = ({ children }: PropsWithChildren) => {
  const [agents, setAgents] = useState<any[]>([]);
  return (
    <AgentsContext.Provider value={{ agents, setAgents }}>
      {children}
    </AgentsContext.Provider>
  );
};
