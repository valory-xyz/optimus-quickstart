import { Button, Flex, Input, Spin, Timeline, Typography, message } from "antd";
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
import { useEthers } from "@/hooks/useEthers";
import {
  CheckSquareTwoTone,
  WarningFilled,
  WarningOutlined,
} from "@ant-design/icons";

enum RPCState {
  LOADING,
  VALID,
  INVALID,
}

export const SpawnRPC = ({
  serviceHash,
  setFundRequirements,
}: {
  serviceHash: string;
  setFundRequirements: Dispatch<SetStateAction<{ [address: string]: number }>>;
}) => {
  const { setSpawnState } = useSpawn();
  const { buildService } = useServices();
  const { checkRPC } = useEthers();

  const [rpc, setRpc] = useState("http://localhost:8545"); // default to hardhat node
  const [continueIsLoading, setContinueIsLoading] = useState(false);
  const [rpcState, setRpcState] = useState<RPCState>(RPCState.INVALID);

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => setRpc(text));
  };

  const handleRpcChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setRpcState(RPCState.LOADING);
      setRpc(e.target.value);
      checkRPC(e.target.value).then((isValid) => {
        try {
          isValid ? setRpcState(RPCState.VALID) : setRpcState(RPCState.INVALID);
        } catch (e) {
          setRpcState(RPCState.INVALID);
        }
      });
    },
    [checkRPC],
  );

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

  const inputStatus = useMemo(() => {
    if (rpcState === RPCState.VALID) return undefined;
    if (rpcState === RPCState.INVALID) return "error";
    return undefined;
  }, [rpcState]);

  const inputSuffix = useMemo(() => {
    if (rpcState === RPCState.LOADING) return <Spin />;
    if (rpcState === RPCState.VALID)
      return <CheckSquareTwoTone twoToneColor="#52c41a" />;
    if (rpcState === RPCState.INVALID) return <WarningOutlined color="red" />;
    return <WarningFilled color="orange" />;
  }, [rpcState]);

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
            <Input
              value={rpc}
              placeholder={"https://..."}
              onChange={handleRpcChange}
              suffix={inputSuffix}
              status={inputStatus}
            ></Input>
            <Button type="primary" onClick={handlePaste}>
              Paste
            </Button>
          </Flex>
        ),
      },
    ],
    [handleRpcChange, inputStatus, inputSuffix, rpc],
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
