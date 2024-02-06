import { Button, Flex, Input, Timeline, Typography } from "antd";
import { NODIES_URL } from "@/constants/urls";
import { useMemo, useState } from "react";
import { useSpawn } from "@/hooks/useSpawn";
import { SpawnState } from "@/enums/SpawnState";

export const SpawnRPC = () => {

    const { setSpawnState } = useSpawn();

    const [rpc, setRpc] = useState('');

    const handlePaste = () => {
        navigator.clipboard.readText().then(text => setRpc(text));
    }

    const handleContinue = () => {
        setSpawnState(SpawnState.FUNDS);
    }

    const items = useMemo(() => [
        // Get nodies account
        {
            children: <Flex gap={8} vertical>
                <Typography.Text>Get a Nodies account</Typography.Text>
                <Button type="primary" href={NODIES_URL} target="_blank">Open nodies site</Button>
            </Flex>
        },
        // Add application
        {
            children: <Flex gap={8} vertical>
                <Typography.Text>Add application</Typography.Text>
                <Typography.Text color="grey">Set Gnosis as network</Typography.Text>
            </Flex>
        },
        // Copy endpoint
        {
            children: <Flex gap={8} vertical>
                <Typography.Text>Copy endpoint</Typography.Text>
                <Typography.Text color="grey">Copy the endpoint from the nodies site</Typography.Text>
            </Flex>
        },
        // Paste endpoint
        {
            children: <Flex gap={8} vertical>
                <Typography.Text>Paste endpoint</Typography.Text>
                <Flex gap={8}>
                    <Input value={rpc} placeholder={"https://..."} onChange={e => setRpc(e.target.value)}></Input>
                    <Button type="primary" onClick={handlePaste}>Paste</Button>
                </Flex>
            </Flex>
        },
    ], [rpc])

    return <Flex gap={8} vertical>
        <Timeline items={items} />
        <Button type="default" onClick={handleContinue}>Continue</Button>
    </Flex>;
}