import { Service, ServiceTemplate } from "@/client";
import {
  SpawnDone,
  SpawnFunds,
  SpawnHeader,
  SpawnRPC,
} from "@/components/Spawn";
import { SpawnScreenState } from "@/enums/SpawnState";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useSpawn } from "@/hooks/useSpawn";
import { message } from "antd";
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
  const { spawnScreenState } = useSpawn();
  const { getServiceTemplate } = useMarketplace();

  const [service, setService] = useState<Service | undefined>();

  const serviceTemplate = useMemo(
    () => getServiceTemplate(serviceTemplateHash),
    [getServiceTemplate, serviceTemplateHash],
  ) as ServiceTemplate;

  const [fundRequirements, setFundRequirements] = useState<{
    [address: string]: number;
  }>({});

  const spawnScreen = useMemo(() => {
    if (spawnScreenState === SpawnScreenState.RPC) {
      return (
        <SpawnRPC
          serviceTemplate={serviceTemplate}
          setFundRequirements={setFundRequirements}
          setService={setService}
        />
      );
    }
    if (spawnScreenState === SpawnScreenState.FUNDS) {
      if (!service) {
        message.error("Service not found");
        return null; // TODO: handle error
      }
      return (
        <SpawnFunds service={service} fundRequirements={fundRequirements} />
      );
    }
    if (spawnScreenState === SpawnScreenState.DONE) {
      return <SpawnDone />;
    }
    return null;
  }, [fundRequirements, service, serviceTemplate, spawnScreenState]);

  return (
    <>
      <SpawnHeader />
      {spawnScreen}
    </>
  );
};

export default SpawnPage;
