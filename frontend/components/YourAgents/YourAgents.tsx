import { useServices } from "@/hooks/useServices";
import { Service } from "@/client";
import { useMemo } from "react";
import dynamic from "next/dynamic";

const HasAgents = dynamic(
  () => import("./HasAgents/HasAgents").then((mod) => mod.HasAgents),
  { ssr: false },
);

const NoAgents = dynamic(
  () => import("./NoAgents/NoAgents").then((mod) => mod.NoAgents),
  { ssr: false },
);

export const YourAgents = () => {
  const { getServicesFromState } = useServices();

  const services: Service[] = useMemo(
    () => getServicesFromState(),
    [getServicesFromState],
  );

  const hasAgents: boolean = useMemo(
    () =>
      services.reduce(
        (acc: boolean, service: Service) => (acc || service ? true : acc),
        false,
      ),
    [services],
  );

  return hasAgents ? <HasAgents services={services} /> : <NoAgents />;
};
