import { SpawnState } from "@/enums";
import { useSpawn } from "@/hooks/useSpawn";
import { Flex, Spin } from "antd";
import { useEffect } from "react";

export const SpawnLoading = () => {
  const { setSpawnState } = useSpawn();

  useEffect(() => {
    fetch("/api/rpc").then((r) => {
      if (r.status !== 200) setSpawnState(SpawnState.RPC);
      r.json().then(({ rpc }) => {
        if (rpc) {
          setSpawnState(SpawnState.FUNDS);
        } else {
          setSpawnState(SpawnState.RPC);
        }
      });
    });
  }, [setSpawnState]);

  return (
    <Flex vertical justify="center" align="center">
      <Spin size="large" />
    </Flex>
  );
};
