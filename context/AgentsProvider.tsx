import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";

type AgentContextType = {
  agents: any[];
  setAgents: Dispatch<SetStateAction<any[]>>;
  isLoading: boolean;
};

export const AgentsContext = createContext<AgentContextType>({
  agents: [],
  setAgents: () => { },
  isLoading: false,
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const AgentsProvider = ({ children }: PropsWithChildren) => {
  const [agents, setAgents] = useState<any[]>([]);
  const { data, error, isLoading } = useSWR("/api/agents", fetcher, {
    refreshInterval: 1000,
  });

  useEffect(() => {
    if (error) return console.log(error);
    setAgents(data);
  }, [data, error]);

  return (
    <AgentsContext.Provider value={{ agents, setAgents, isLoading }}>
      {children}
    </AgentsContext.Provider>
  );
};
