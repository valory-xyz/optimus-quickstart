import { SpawnScreenState } from "@/enums/SpawnState";
import { Tab } from "@/enums/Tabs";
import { useSpawn } from "@/hooks/useSpawn";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex } from "antd";
import { useRouter } from "next/router";

export const SpawnDone = () => {
  const router = useRouter();

  const { setSpawnScreenState } = useSpawn();
  const { setActiveTab } = useTabs();

  const handleViewAgent = () => {
    router.push("/").then(() => {
      setActiveTab(Tab.YOUR_AGENTS);
      setSpawnScreenState(SpawnScreenState.RPC);
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
