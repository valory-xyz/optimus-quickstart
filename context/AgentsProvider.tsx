import { Agent } from "@/types/Agent";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from "react";
import useSWR from "swr";

type AgentContextType = {
  agents: any[];
  setAgents: Dispatch<SetStateAction<Agent[]>>;
  isLoading: boolean;
};

export const AgentsContext = createContext<AgentContextType>({
  agents: [],
  setAgents: () => {},
  isLoading: false,
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const AgentsProvider = ({ children }: PropsWithChildren) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { data, error, isLoading } = useSWR("/api/agents", fetcher, {
    // refreshInterval: 1000, // COMMENTED FOR MOCK
  });

  // REMOVED FOR MOCK
  // useEffect(() => {
  //   if (error) return console.log(error);
  //   setAgents(data ?? []);
  // }, [data, error]);

  return (
    <AgentsContext.Provider value={{ agents, setAgents, isLoading }}>
      {children}
    </AgentsContext.Provider>
  );
};
