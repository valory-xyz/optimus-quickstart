import { SpawnRPC } from '@/components/Spawn';
import { SpawnScreen } from '@/enums';
import { useServices, useSpawn, useServiceTemplates } from '@/hooks';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { ReactElement, useEffect, useMemo } from 'react';

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

const SpawnMasterWalletFunding = dynamic(
  () =>
    import('@/components/Spawn/SpawnMasterWalletFunding').then(
      (mod) => mod.SpawnMasterWalletFunding,
    ),
  { ssr: false },
);

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { serviceTemplateHash, screen } = context.query;
  return { props: { serviceTemplateHash, screen: screen ? screen : null } };
};

type SpawnPageProps = {
  serviceTemplateHash: string;
  screen: SpawnScreen | null;
};

export const SpawnPage = (props: SpawnPageProps) => {
  const { getServiceFromState } = useServices();
  const { getServiceTemplate } = useServiceTemplates();
  const { setSpawnData, spawnData } = useSpawn();

  useEffect(() => {
    try {
      const serviceTemplate = getServiceTemplate(props.serviceTemplateHash);
      if (!serviceTemplate) throw new Error('Service template not found');
      if (props.screen === null) {
        // No resume required
        setSpawnData((prev) => ({ ...prev, serviceTemplate }));
      } else {
        // Funding, resume required
        const service = getServiceFromState(props.serviceTemplateHash);
        if (!service) throw new Error('Service not found');
        const {
          ledger: { rpc },
        } = service;
        setSpawnData((prev) => ({
          ...prev,
          serviceTemplate,
          screen: props.screen as SpawnScreen, // cast required though it's not null; TS doesn't not support typeof or instanceof for enum
          rpc,
        }));
      }
    } catch (e) {
      setSpawnData((prev) => ({
        ...prev,
        screen: SpawnScreen.ERROR,
      }));
    }
    // Runs once, no deps required as it will reset "screen" state attribute
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnScreen: ReactElement = useMemo(() => {
    switch (spawnData.screen) {
      case SpawnScreen.RPC:
        return <SpawnRPC nextPage={SpawnScreen.MASTER_WALLET_FUNDING} />;

      case SpawnScreen.MASTER_WALLET_FUNDING:
        return (
          <SpawnMasterWalletFunding nextPage={SpawnScreen.STAKING_CHECK} />
        );

      case SpawnScreen.STAKING_CHECK:
        return <SpawnStakingCheck nextPage={SpawnScreen.AGENT_FUNDING} />;

      case SpawnScreen.AGENT_FUNDING:
        return <SpawnAgentFunding nextPage={SpawnScreen.DONE} />;

      case SpawnScreen.DONE:
        return <SpawnDone />;

      default:
        return <SpawnError message="Invalid spawn page" />;
    }
  }, [spawnData.screen]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
