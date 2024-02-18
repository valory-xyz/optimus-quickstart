import { Service, ServiceTemplate } from "@/client";
import {
  SpawnDone,
  SpawnAgentFunding,
  SpawnHeader,
  SpawnRPC,
  SpawnStakingCheck,
  SpawnStakingFunding,
} from "@/components/Spawn";
import { SpawnScreenState } from "@/enums/SpawnState";
import { useMarketplace, useSpawn } from "@/hooks";
import { GetServerSidePropsContext } from "next";
import { useMemo, useState } from "react";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { serviceTemplateHash } = context.query;
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

  const serviceTemplate: ServiceTemplate = useMemo(
    () => getServiceTemplate(serviceTemplateHash),
    [getServiceTemplate, serviceTemplateHash],
  );

  const [agentFundRequirements, setAgentFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const [stakingFundRequirements, setStakingFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const spawnScreen = useMemo(() => {
    if (spawnScreenState === SpawnScreenState.STAKING_CHECK) {
      return (
        <SpawnStakingCheck
          setSpawnScreenState={setSpawnScreenState}
          setIsStaking={setIsStaking}
          nextPage={SpawnScreenState.RPC}
        />
      );
    }
    if (spawnScreenState === SpawnScreenState.RPC) {
      return (
        <SpawnRPC
          {...{
            serviceTemplate,
            setService,
            isStaking,
            setAgentFundRequirements,
            setStakingFundRequirements,
          }}
          nextPage={
            isStaking
              ? SpawnScreenState.STAKING_FUNDING
              : SpawnScreenState.AGENT_FUNDING
          }
        />
      );
    }
    if (spawnScreenState === SpawnScreenState.STAKING_FUNDING)
      return (
        <SpawnStakingFunding
          {...{ service: service as Service, stakingFundRequirements }}
          nextPage={SpawnScreenState.AGENT_FUNDING}
        />
      );
    if (spawnScreenState === SpawnScreenState.AGENT_FUNDING)
      return (
        <SpawnAgentFunding
          {...{ service: service as Service, agentFundRequirements }}
          nextPage={SpawnScreenState.DONE}
        />
      );

    if (spawnScreenState === SpawnScreenState.DONE) {
      return <SpawnDone />;
    }
    return null;
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
