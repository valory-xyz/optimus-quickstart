import { Service, ServiceTemplate } from '@/client';
import { SpawnRPC } from '@/components/Spawn';
import { SpawnScreenState } from '@/enums';
import { useMarketplace, useSpawn } from '@/hooks';
import { Address } from '@/types';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { ReactElement, useMemo, useState } from 'react';

const SpawnAgentFunding = dynamic(
  () =>
    import('@/components/Spawn/SpawnAgentFunding').then(
      (mod) => mod.SpawnAgentFunding,
    ),
  { ssr: false },
);

const SpawnDone = dynamic(
  () => import('@/components/Spawn/SpawnDone').then((mod) => mod.SpawnDone),
  { ssr: false },
);

const SpawnHeader = dynamic(
  () => import('@/components/Spawn/SpawnHeader').then((mod) => mod.SpawnHeader),
  { ssr: false },
);

const SpawnStakingCheck = dynamic(
  () =>
    import('@/components/Spawn/SpawnStakingCheck').then(
      (mod) => mod.SpawnStakingCheck,
    ),
  { ssr: false },
);

const SpawnError = dynamic(
  () => import('@/components/Spawn/SpawnError').then((mod) => mod.SpawnError),
  { ssr: false },
);

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { serviceTemplateHash } = context.query;
  return { props: { serviceTemplateHash } };
};

type SpawnPageProps = {
  serviceTemplateHash: string;
};

export const SpawnPage = ({ serviceTemplateHash }: SpawnPageProps) => {
  const { spawnScreenState, setSpawnScreenState } = useSpawn();
  const { getServiceTemplate } = useMarketplace();

  const [service, setService] = useState<Service>();
  const [rpc, setRpc] = useState('http://localhost:8545'); // hardcoded default for now
  const [isStaking, setIsStaking] = useState<boolean>(false);

  const serviceTemplate: ServiceTemplate | undefined = useMemo(
    () => getServiceTemplate(serviceTemplateHash),
    [getServiceTemplate, serviceTemplateHash],
  );

  const [agentFundRequirements, setAgentFundRequirements] = useState<{
    [address: Address]: number;
  }>({});

  const spawnScreen: ReactElement = useMemo(() => {
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
