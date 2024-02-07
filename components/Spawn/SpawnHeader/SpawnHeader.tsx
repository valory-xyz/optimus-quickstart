import { useSpawn } from "@/hooks/useSpawn";
import { mainTheme } from "@/theme/mainTheme";
import { Flex, Progress, Typography } from "antd";
import Image from "next/image";
import { useMemo } from "react";

export const SpawnHeader = () => {
  const { spawnPercentage } = useSpawn();

  const title = useMemo(
    () => (spawnPercentage === 100 ? "Agent Spawned" : "Spawning your Agent"),
    [spawnPercentage],
  );

  return (
    <Flex gap={8} vertical align="center">
      <Image src="/robot-head.png" alt="robot head" width={200} height={200} />
      <Typography.Title level={4}>{title}</Typography.Title>
      <Progress
        percent={spawnPercentage}
        strokeColor={mainTheme.token?.colorPrimary}
        showInfo={false}
        style={{ width: "50%" }}
      />
    </Flex>
  );
};
