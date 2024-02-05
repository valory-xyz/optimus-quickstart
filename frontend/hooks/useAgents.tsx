
import { AgentsContext } from "@/context/AgentsProvider";
import { useContext } from "react";

export const useAgents = () => {
    const { agents, setAgents } = useContext(AgentsContext);

    const runAgent = async (id: number) => {
        const response = await fetch(`/api/agents/run?id=${id}`);
        const data = await response.json();
        return data;
    }

    return { runAgent };
};