import { AgentStatus } from "@/enums/AgentStatus";
import { SpawnState } from "@/enums/SpawnState";
import { Tab } from "@/enums/Tabs";
import { useAgents } from "@/hooks/useAgents";
import { useSpawn } from "@/hooks/useSpawn";
import { useTabs } from "@/hooks/useTabs";
import { Agent } from "@/types/Agent";
import { Button, Flex } from "antd";
import { useRouter } from "next/router";

export const SpawnDone = ({ serviceHash }: { serviceHash: string }) => {
  const router = useRouter();

  const { addAgent } = useAgents();
  const { setSpawnState } = useSpawn();
  const { setActiveTab } = useTabs();

  const handleViewAgent = () => {
    addAgent({
      id: 1,
      name: "Test Agent",
      description: "Test description",
      image_src: "/marketplace/prediction-agent.png",
      status: AgentStatus.RUNNING,
      earnings_24h: 0,
      total_balance: 0,
      serviceHash,
    } as Agent);
    router.push("/").then(() => {
      setActiveTab(Tab.YOUR_AGENTS);
      setSpawnState(SpawnState.RPC);
    });
  };

  return (
    <Flex gap={8} vertical>
      <Button type="primary" onClick={handleViewAgent}>
        View agent
      </Button>
    </Flex>
  );
};
