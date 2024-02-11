import {
  SpawnDone,
  SpawnFunds,
  SpawnHeader,
  SpawnRPC,
} from "@/components/Spawn";
import { SpawnState } from "@/enums/SpawnState";
import { useSpawn } from "@/hooks/useSpawn";
import { GetServerSidePropsContext } from "next";
import { useMemo, useState } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { serviceHash } = context.query;
  return { props: { serviceHash } };
};

export const SpawnPage = ({ serviceHash }: { serviceHash: string }) => {
  const { spawnState } = useSpawn();

  const [fundRequirements, setFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const spawnScreen = useMemo(() => {
    if (spawnState === SpawnState.RPC) {
      return <SpawnRPC serviceHash={serviceHash} />;
    }
    if (spawnState === SpawnState.FUNDS) {
      return (
        <SpawnFunds
          fundRequirements={fundRequirements}
          setFundRequirements={setFundRequirements}
        />
      );
    }
    if (spawnState === SpawnState.DONE) {
      return <SpawnDone />;
    }
    return null;
  }, [fundRequirements, serviceHash, spawnState]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
