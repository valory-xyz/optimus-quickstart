import { useSpawn } from "@/hooks/useSpawn";
import { Progress, Typography } from "antd";
import Image from "next/image";

export const SpawnHeader = () => {
    const { spawnPercentage } = useSpawn();
    return (
        <>
            <Image src="/robot-head.png" alt="robot head" width={200} height={200} />
            <Typography.Title>Spawn your Agent</Typography.Title>
            <Progress percent={spawnPercentage} />
        </>
    );
}

