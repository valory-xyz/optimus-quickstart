import { useSpawn } from "@/hooks/useSpawn";
import { Progress, Typography } from "antd";
import Image from "next/image";
import { useMemo } from "react";

export const SpawnHeader = () => {
  const { spawnPercentage } = useSpawn();

  const title = useMemo(
    () => (spawnPercentage === 100 ? "Agent Spawned" : "Spawn your Agent"),
    [spawnPercentage],
  );

  return (
    <>
      <Image src="/robot-head.png" alt="robot head" width={200} height={200} />
      <Typography.Title>{title}</Typography.Title>
      <Progress percent={spawnPercentage} />
    </>
  );
};
