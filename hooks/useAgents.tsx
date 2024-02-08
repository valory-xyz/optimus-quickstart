import { AgentsContext } from "@/context/AgentsProvider";
import { AgentStatus } from "@/enums/AgentStatus";
import { Agent } from "@/types/Agent";
import { useContext } from "react";

export const useAgents = () => {
  const { agents, setAgents } = useContext(AgentsContext);

  const addAgent = async (agent: Agent) => {
    setAgents((prev) => [...prev, agent]);
  };

  const removeAgent = async (agent: Agent) => {
    setAgents((prev) => prev.filter((_agent) => _agent.id !== agent.id));
  };

  const updateAgentStatus = async (agent: Agent, status: AgentStatus) => {
    setAgents((prev) =>
      prev.map((_agent) => {
        if (_agent.id === agent.id) {
          return { ..._agent, status };
        }
        return _agent;
      }),
    );
  };

  return {
    addAgent,
    removeAgent,
    updateAgentStatus,
    agents,
  };
};
