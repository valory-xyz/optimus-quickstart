import {
  SpawnDone,
  SpawnFunds,
  SpawnHeader,
  SpawnRPC,
} from "@/components/Spawn";
import { SpawnState } from "@/enums/SpawnState";
import { useSpawn } from "@/hooks/useSpawn";
import { GetServerSidePropsContext } from "next";
import { useMemo } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { serviceHash } = context.query;
  return { props: { serviceHash } };
};

export const SpawnPage = ({ serviceHash }: { serviceHash: string }) => {
  const { spawnState } = useSpawn();

  const spawnScreen = useMemo(() => {
    if (spawnState === SpawnState.RPC) {
      return <SpawnRPC serviceHash={serviceHash} />;
    }
    if (spawnState === SpawnState.FUNDS) {
      return <SpawnFunds serviceHash={serviceHash} />;
    }
    if (spawnState === SpawnState.DONE) {
      return <SpawnDone serviceHash={serviceHash} />;
    }
    return null;
  }, [serviceHash, spawnState]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
