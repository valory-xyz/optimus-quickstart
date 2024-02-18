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
import { SpawnScreenState } from "@/enums";
import { useEthers } from "@/hooks/useEthers";
import {
  CheckSquareTwoTone,
  WarningFilled,
  WarningOutlined,
} from "@ant-design/icons";
import { Service, ServiceTemplate } from "@/client";
import { InputStatus } from "antd/es/_util/statusUtils";
import _ from "lodash";

enum RPCState {
  LOADING,
  VALID,
  INVALID,
}

export const SpawnRPC = ({
  serviceTemplate,
  isStaking,
  setAgentFundRequirements,
  setStakingFundRequirements,
  setService,
  nextPage,
}: {
  serviceTemplate: ServiceTemplate;
  isStaking: boolean;
  setAgentFundRequirements: Dispatch<
    SetStateAction<{ [address: string]: number }>
  >;
  setStakingFundRequirements: Dispatch<
    SetStateAction<{ [address: string]: number }>
  >;
  setService: Dispatch<SetStateAction<Service | undefined>>;
  nextPage: SpawnScreenState;
}) => {
  const { setSpawnScreenState } = useSpawn(isStaking);
  const { createService } = useServices();
  const { checkRPC } = useEthers();

  const [rpc, setRpc] = useState("http://localhost:8545"); // default to hardhat node during development
  const [continueIsLoading, setContinueIsLoading] = useState(false);
  const [isCheckingRpc, setIsCheckingRpc] = useState(false);
  const [rpcState, setRpcState] = useState<RPCState>(RPCState.INVALID);

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => setRpc(text));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceCheckRpc = useCallback(
    _.debounce((rpc: string) => {
      if (isCheckingRpc) return;
      setIsCheckingRpc(true);
      checkRPC(rpc)
        .then((valid) => setRpcState(valid ? RPCState.VALID : RPCState.INVALID))
        .catch(() => {
          message.error("Failed to check RPC");
        })
        .finally(() => setIsCheckingRpc(false));
    }, 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRpcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRpc(e.target.value);
    setRpcState(RPCState.LOADING);
    debounceCheckRpc(e.target.value);
  };

  const handleContinue = useCallback(async () => {
    if (continueIsLoading)
      return message.info("Please wait for the current action to complete");
    setContinueIsLoading(true);
    createService({
      ...serviceTemplate,
      configuration: {
        ...serviceTemplate.configuration,
        rpc,
        use_staking: isStaking,
      },
    })
      .then((_service: Service) => {
        setService(_service);

        //  Set agent funding requirements
        if (_service.chain_data?.instances) {
          setAgentFundRequirements(
            _service.chain_data.instances.reduce(
              (acc: { [address: string]: number }, address: string) => ({
                ...acc,
                [address]:
                  serviceTemplate.configuration.fund_requirements.agent,
              }),
              {},
            ),
          );
        }

        // Set staking funding requirements from multisig/safe
        if (isStaking && _service.chain_data?.multisig) {
          setStakingFundRequirements({
            [_service.chain_data.multisig]:
              serviceTemplate.configuration.fund_requirements.safe,
          });
        }

        // Then goto next screen
        return setSpawnScreenState(nextPage);
      })
      .catch((err) => {
        message.error(err.message);
      })
      .finally(() => setContinueIsLoading(false));
  }, [
    continueIsLoading,
    createService,
    isStaking,
    nextPage,
    rpc,
    serviceTemplate,
    setAgentFundRequirements,
    setService,
    setSpawnScreenState,
    setStakingFundRequirements,
  ]);

  const isContinueDisabled = useMemo(
    () => !rpc || rpcState !== RPCState.VALID,
    [rpc, rpcState],
  );

  const inputStatus: InputStatus = useMemo(() => {
    if (rpcState === RPCState.VALID) return "";
    if (rpcState === RPCState.INVALID) return "error";
    return "";
  }, [rpcState]);

  const inputSuffix: JSX.Element = useMemo(() => {
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
              Copy the endpoint from the Nodies site
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
      <Typography.Text strong>Get an RPC</Typography.Text>
      <Timeline items={items} />
      <Button
        type="default"
        onClick={handleContinue}
        disabled={isContinueDisabled}
        loading={continueIsLoading}
      >
        Continue
      </Button>
    </Flex>
  );
};
