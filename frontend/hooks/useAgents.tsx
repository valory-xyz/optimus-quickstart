import { AgentsContext } from "@/context/AgentsProvider";
import { useContext } from "react";

export const useAgents = () => {
  const { agents, setAgents } = useContext(AgentsContext);

  const updateAgents = async () => {
    console.log("Updating agents");
    const response = await fetch("/api/agents");
    const data = await response.json();
    setAgents(data);
  };

  const startAgent = async (id: number) => {
    console.log("Starting Agent with id: ", id);
    const response = await fetch(`/api/agents/run?id=${id}`);
    const data = await response.json();
    return data;
  };

  const stopAgent = async (id: number) => {
    console.log("Stopping Agent with id: ", id);
    const response = await fetch(`/api/agents/stop?id=${id}`);
    const data = await response.json();
    return data;
  };

  return { startAgent, agents, updateAgents, stopAgent };
};
