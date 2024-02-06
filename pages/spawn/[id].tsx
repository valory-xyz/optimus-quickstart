import { SpawnDone } from "@/components/Spawn/SpawnDone/SpawnDone";
import { SpawnFunds } from "@/components/Spawn/SpawnFunds/SpawnFunds";
import { SpawnHeader } from "@/components/Spawn/SpawnHeader/SpawnHeader";
import { SpawnRPC } from "@/components/Spawn/SpawnRPC/SpawnRPC";
import { SpawnState } from "@/enums/SpawnState";
import { useSpawn } from "@/hooks/useSpawn";
import { useMemo } from "react";


export const SpawnPage = ({ params }: { params: { id: number } }) => {

    const { spawnState } = useSpawn();

    const spawnScreen = useMemo(() => {
        if (spawnState === SpawnState.RPC) {
            return <SpawnRPC />
        }
        if (spawnState === SpawnState.FUNDS) {
            return <SpawnFunds />
        }
        if (spawnState === SpawnState.DONE) {
            return <SpawnDone />
        }
        return null;
    }, [spawnState])

    return <>
        {params.id}
        <SpawnHeader />
        {spawnScreen}
    </>;
};

export default SpawnPage;