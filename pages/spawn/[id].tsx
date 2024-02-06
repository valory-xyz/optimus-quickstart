import {
  SpawnDone,
  SpawnFunds,
  SpawnHeader,
  SpawnRPC,
} from "@/components/Spawn";
import { SpawnState } from "@/enums/SpawnState";
import { useSpawn } from "@/hooks/useSpawn";
import { useMemo } from "react";

export const SpawnPage = () => {
  const { spawnState } = useSpawn();

  const spawnScreen = useMemo(() => {
    if (spawnState === SpawnState.RPC) {
      return <SpawnRPC />;
    }
    if (spawnState === SpawnState.FUNDS) {
      return <SpawnFunds />;
    }
    if (spawnState === SpawnState.DONE) {
      return <SpawnDone />;
    }
    return null;
  }, [spawnState]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
