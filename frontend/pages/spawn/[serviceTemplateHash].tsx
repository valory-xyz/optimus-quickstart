import { Service, ServiceTemplate } from "@/client";
import {
  SpawnAgentFunding,
  SpawnDone,
  SpawnHeader,
  SpawnRPC,
  SpawnStakingCheck,
  SpawnStakingFunding,
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
  const [isStaking, setIsStaking] = useState<boolean>(false);

  const serviceTemplate: ServiceTemplate | undefined = useMemo(
    () => getServiceTemplate(serviceTemplateHash),
    [getServiceTemplate, serviceTemplateHash],
  );

  const [agentFundRequirements, setAgentFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const [stakingFundRequirements, setStakingFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const spawnScreen: JSX.Element = useMemo(() => {
    if (!serviceTemplate)
      return <SpawnError message="Invalid service template" />;

    // STAKING CHECK & RPC
    switch (spawnScreenState) {
      case SpawnScreenState.STAKING_CHECK:
        return (
          <SpawnStakingCheck
            setSpawnScreenState={setSpawnScreenState}
            setIsStaking={setIsStaking}
            nextPage={SpawnScreenState.RPC}
          />
        );
      case SpawnScreenState.RPC: {
        const nextPage: SpawnScreenState = isStaking
          ? SpawnScreenState.STAKING_FUNDING
          : SpawnScreenState.AGENT_FUNDING;
        return (
          <SpawnRPC
            {...{
              serviceTemplate,
              setService,
              isStaking,
              setAgentFundRequirements,
              setStakingFundRequirements,
            }}
            nextPage={nextPage}
          />
        );
      }
      default:
        break;
    }

    if (!service) return <SpawnError message="Invalid service" />;

    // FUNDING SCREENS & DONE
    switch (spawnScreenState) {
      case SpawnScreenState.STAKING_FUNDING: {
        return (
          <SpawnStakingFunding
            {...{ service, stakingFundRequirements }}
            nextPage={SpawnScreenState.AGENT_FUNDING}
          />
        );
      }
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
    service,
    serviceTemplate,
    setSpawnScreenState,
    spawnScreenState,
    stakingFundRequirements,
  ]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
