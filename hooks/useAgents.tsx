import { AgentsContext } from "@/context/AgentsProvider";
import { useContext } from "react";

export const useAgents = () => {
  const { agents, setAgents } = useContext(AgentsContext);

  const testFlask = async () => {
    const response = await fetch("/api/test");
    const data = await response.json();
    console.log(data);
  }

  const updateAgents = async () => {
    const response = await fetch("/api/agents");
    const data = await response.json();
    setAgents(data);
  };

  const startAgent = async (id: number) => {
    const response = await fetch(`/api/agents/run?id=${id}`);
    const data = await response.json();
    return data;
  };

  const stopAgent = async (id: number) => {
    const response = await fetch(`/api/agents/stop?id=${id}`);
    const data = await response.json();
    return data;
  };

  return { startAgent, agents, updateAgents, stopAgent, testFlask };
};
