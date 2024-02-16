import { SpawnScreenState } from "@/enums/SpawnState";
import { Tab } from "@/enums/Tabs";
import { useServices, useSpawn, useTabs } from "@/hooks";
import { Button, Flex } from "antd";
import { useRouter } from "next/router";

export const SpawnDone = () => {
  const router = useRouter();

  const { setSpawnScreenState } = useSpawn();
  const { setActiveTab } = useTabs();
  const { updateServicesState } = useServices();

  const handleViewAgent = () => {
    router.push("/").then(() => {
      updateServicesState();
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
