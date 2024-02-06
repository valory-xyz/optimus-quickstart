import { SpawnState } from "@/enums/SpawnState";
import { Tab } from "@/enums/Tabs";
import { useSpawn } from "@/hooks/useSpawn";
import { useTabs } from "@/hooks/useTabs";
import { Button, Flex } from "antd";
import { useRouter } from "next/router";

export const SpawnDone = () => {
    const router = useRouter();

    const { setSpawnState } = useSpawn();
    const { setActiveTab } = useTabs()

    const handleViewAgent = () => {
        router.push("/", undefined, { shallow: true }).then(() => {
            setActiveTab(Tab.YOUR_AGENTS);
            setSpawnState(SpawnState.RPC);
        });
    }

    return <Flex gap={8} vertical>
        <Button type="primary" onClick={handleViewAgent}>
            View agent
        </Button>
    </Flex>;
}