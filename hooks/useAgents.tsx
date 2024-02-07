import { AgentsContext } from "@/context/AgentsProvider";
import { AgentStatus } from "@/enums/AgentStatus";
import { useContext } from "react";

export const useAgents = () => {
  const { agents, setAgents } = useContext(AgentsContext);

  const addAgent = async (id: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, status: AgentStatus.RUNNING } : agent,
      ),
    );
  };

  const removeAgent = async (id: number) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, status: AgentStatus.STOPPED } : agent,
      ),
    );
  };

  return {
    addAgent,
    removeAgent,
    agents,
  };
};
