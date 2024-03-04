import { SpawnRPC } from '@/components/Spawn';
import { SpawnScreen } from '@/enums';
import { useSpawn } from '@/hooks';
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
  const { serviceTemplateHash } = context.query;
  return { props: { serviceTemplateHash } };
};

type SpawnPageProps = {
  serviceTemplateHash: string;
};

export const SpawnPage = ({ serviceTemplateHash }: SpawnPageProps) => {
  const { screen, setSpawnData } = useSpawn();

  useEffect(() => {
    setSpawnData((prev) => {
      return {
        ...prev,
        serviceTemplateHash,
      };
    });
    // Not required to run this effect on every render, only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnScreen: ReactElement = useMemo(() => {
    switch (screen) {
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
  }, [screen]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
