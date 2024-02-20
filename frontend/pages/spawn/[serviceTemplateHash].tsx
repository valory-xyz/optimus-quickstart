import { Service, ServiceTemplate } from "@/client";
import {
  SpawnAgentFunding,
  SpawnDone,
  SpawnHeader,
  SpawnRPC,
  SpawnStakingCheck,
} from "@/components/Spawn";
import { SpawnError } from "@/components/Spawn/SpawnError/SpawnError";
import { SpawnScreenState } from "@/enums";
import { useMarketplace, useSpawn } from "@/hooks";
import { GetServerSidePropsContext } from "next";
import { useMemo, useState } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { serviceTemplateHash } = context.query;
  if (!serviceTemplateHash) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { serviceTemplateHash } };
};

export const SpawnPage = ({
  serviceTemplateHash,
}: {
  serviceTemplateHash: string;
}) => {
  const { spawnScreenState, setSpawnScreenState } = useSpawn();
  const { getServiceTemplate } = useMarketplace();

  const [service, setService] = useState<Service>();
  const [rpc, setRpc] = useState("http://localhost:8545"); // hardcoded default for now
  const [isStaking, setIsStaking] = useState<boolean>(false);

  const serviceTemplate: ServiceTemplate | undefined = useMemo(
    () => getServiceTemplate(serviceTemplateHash),
    [getServiceTemplate, serviceTemplateHash],
  );

  const [agentFundRequirements, setAgentFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const spawnScreen: JSX.Element = useMemo(() => {
    if (!serviceTemplate)
      return <SpawnError message="Invalid service template" />;

    // STAKING CHECK & RPC
    switch (spawnScreenState) {
      case SpawnScreenState.RPC: {
        return (
          <SpawnRPC
            {...{
              rpc,
              setRpc,
              serviceTemplate,
              setService,
              isStaking,
            }}
            nextPage={SpawnScreenState.STAKING_CHECK}
          />
        );
      }
      case SpawnScreenState.STAKING_CHECK:
        return (
          <SpawnStakingCheck
            {...{
              serviceTemplate,
              rpc,
              setAgentFundRequirements,
              setSpawnScreenState,
              setIsStaking,
              setService,
            }}
            nextPage={SpawnScreenState.AGENT_FUNDING}
          />
        );
      default:
        break;
    }

    if (!service) return <SpawnError message="Invalid service" />;

    // FUNDING SCREENS & DONE
    switch (spawnScreenState) {
      case SpawnScreenState.AGENT_FUNDING:
        return (
          <SpawnAgentFunding
            {...{ service, agentFundRequirements }}
            nextPage={SpawnScreenState.DONE}
          />
        );
      case SpawnScreenState.DONE:
        return <SpawnDone />;
      default:
        return <SpawnError message="Invalid spawn page" />;
    }
  }, [
    agentFundRequirements,
    isStaking,
    rpc,
    service,
    serviceTemplate,
    setSpawnScreenState,
    spawnScreenState,
  ]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
