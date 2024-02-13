import { Button, Flex, Input, Timeline, Typography, message } from "antd";
import { NODIES_URL } from "@/constants/urls";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useSpawn } from "@/hooks/useSpawn";
import { useServices } from "@/hooks/useServices";
import { SpawnState } from "@/enums";
import { BuildServiceResponse } from "@/types/BuildServiceResponse";

export const SpawnRPC = ({
  serviceHash,
  setFundRequirements,
}: {
  serviceHash: string;
  setFundRequirements: Dispatch<SetStateAction<{ [address: string]: number }>>;
}) => {
  const { setSpawnState } = useSpawn();
  const { buildService, startService } = useServices();

  const [rpc, setRpc] = useState("http://localhost:8545"); // default to hardhat node
  const [continueIsLoading, setContinueIsLoading] = useState(false);

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => setRpc(text));
  };

  const handleContinue = useCallback(async () => {
    if (continueIsLoading)
      return message.info("Please wait for the current action to complete");
    setContinueIsLoading(true);
    buildService(serviceHash, rpc)
      .then((res: BuildServiceResponse) => {
        console.log(res);
        setFundRequirements(res.fund_requirements);
        setSpawnState(SpawnState.FUNDS);
      })
      .catch((err) => {
        message.error(err.message);
      })
      .finally(() => setContinueIsLoading(false));
  }, [
    buildService,
    continueIsLoading,
    rpc,
    serviceHash,
    setFundRequirements,
    setSpawnState,
  ]);

  const items = useMemo(
    () => [
      // Get nodies account
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Get a Nodies account</Typography.Text>
            <Button type="primary" href={NODIES_URL} target="_blank">
              Open nodies site
            </Button>
          </Flex>
        ),
      },
      // Add application
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Add application</Typography.Text>
            <Typography.Text color="grey">
              Set Gnosis as network
            </Typography.Text>
          </Flex>
        ),
      },
      // Copy endpoint
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Copy endpoint</Typography.Text>
            <Typography.Text color="grey">
              Copy the endpoint from the nodies site
            </Typography.Text>
          </Flex>
        ),
      },
      // Paste endpoint
      {
        children: (
          <Flex gap={8} vertical>
            <Typography.Text>Paste endpoint</Typography.Text>
            <Flex gap={8}>
              <Input
                value={rpc}
                placeholder={"https://..."}
                onChange={(e) => setRpc(e.target.value)}
              ></Input>
              <Button type="primary" onClick={handlePaste}>
                Paste
              </Button>
            </Flex>
          </Flex>
        ),
      },
    ],
    [rpc],
  );

  return (
    <Flex gap={8} vertical>
      <Timeline items={items} />
      <Button
        type="default"
        onClick={handleContinue}
        disabled={!rpc}
        loading={continueIsLoading}
      >
        Continue
      </Button>
    </Flex>
  );
};
