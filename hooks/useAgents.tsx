import { AgentsContext } from "@/context/AgentsProvider";
import { AgentStatus } from "@/enums/AgentStatus";
import { useContext } from "react";

export const useAgents = () => {
  const { agents, setAgents } = useContext(AgentsContext);

  const updateAgents = async () => {
    const response = await fetch("/api/agents");
    const data = await response.json();
    setAgents(data);
  };

  const startAgent = async (id: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, status: AgentStatus.RUNNING } : agent,
      ),
    );
  };

  const stopAgent = async (id: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, status: AgentStatus.STOPPED } : agent,
      ),
    );
  };

  const deleteAgent = async (id: number) => {
    setAgents((prev) => {
      const newArray = prev.filter((agent) => agent.id !== id);
      return newArray;
    });
  };

  return {
    startAgent,
    agents,
    updateAgents,
    stopAgent,
    setAgents,
    deleteAgent,
  };
};
