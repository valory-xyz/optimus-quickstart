import {
  Button,
  Flex,
  Input,
  Spin,
  Timeline,
  TimelineItemProps,
  Typography,
  message,
} from "antd";
import { NODIES_URL } from "@/constants/urls";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useSpawn, useServices, useEthers } from "@/hooks";
import { SpawnScreenState } from "@/enums";
import { CheckSquareTwoTone, WarningFilled } from "@ant-design/icons";
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
  setService,
  nextPage,
}: {
  serviceTemplate: ServiceTemplate;
  isStaking: boolean;
  setAgentFundRequirements: Dispatch<
    SetStateAction<{ [address: string]: number }>
  >;
  setService: Dispatch<SetStateAction<Service | undefined>>;
  nextPage: SpawnScreenState;
}) => {
  const { setSpawnScreenState } = useSpawn(isStaking);
  const { createService } = useServices();
  const { checkRPC } = useEthers();

  const [rpc, setRpc] = useState("http://localhost:8545"); // hardcoded default for now
  const [continueIsLoading, setContinueIsLoading] = useState(false);
  const [isCheckingRpc, setIsCheckingRpc] = useState(false);
  const [rpcState, setRpcState] = useState<RPCState>(RPCState.INVALID);

  const handlePaste = async (): Promise<void> =>
    navigator.clipboard
      .readText()
      .then((text) => setRpc(text))
      .catch(() => {
        message.error("Failed to read clipboard");
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceCheckRpc = useCallback(
    _.debounce((_rpc: string) => {
      if (isCheckingRpc) return;
      if (!_rpc) return;
      setIsCheckingRpc(true);
      checkRPC(_rpc)
        .then((valid: boolean) =>
          setRpcState(valid ? RPCState.VALID : RPCState.INVALID),
        )
        .catch(() => {
          setRpcState(RPCState.INVALID);
          message.error("Failed to check RPC");
        })
        .finally(() => setIsCheckingRpc(false));
    }, 1000),
    [],
  );

  const handleRpcChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRpc(e.target.value);
      setRpcState(RPCState.LOADING);
      debounceCheckRpc(e.target.value);
    },
    [debounceCheckRpc],
  );

  const handleContinue = useCallback(async () => {
    if (continueIsLoading) {
      message.info("Please wait for the current action to complete");
      return;
    }
    if (!rpc || rpcState !== RPCState.VALID) {
      message.error("Invalid RPC");
      return;
    }
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
        if (_service.chain_data?.multisig) {
          setAgentFundRequirements((prev) => ({
            ...prev,
            [_service.chain_data?.multisig as string]:
              serviceTemplate.configuration.fund_requirements.safe,
          }));
        }

        // Then goto next screen
        setSpawnScreenState(nextPage);
      })
      .catch(() => {
        message.error("Failed to create service");
      })
      .finally(() => setContinueIsLoading(false));
  }, [
    continueIsLoading,
    createService,
    isStaking,
    nextPage,
    rpc,
    rpcState,
    serviceTemplate,
    setAgentFundRequirements,
    setService,
    setSpawnScreenState,
  ]);

  const isContinueDisabled: boolean = useMemo(
    () => !rpc || rpcState !== RPCState.VALID,
    [rpc, rpcState],
  );

  const inputStatus: InputStatus = useMemo(() => {
    switch (rpcState) {
      case RPCState.LOADING:
        return "";
      case RPCState.VALID:
        return "";
      case RPCState.INVALID:
        return "error";
      default:
        return "";
    }
  }, [rpcState]);

  const inputSuffix: JSX.Element = useMemo(() => {
    switch (rpcState) {
      case RPCState.LOADING:
        return <Spin />;
      case RPCState.VALID:
        return <CheckSquareTwoTone twoToneColor="#52c41a" />;
      case RPCState.INVALID:
        return <WarningFilled color="red" />;
      default:
        return <WarningFilled color="orange" />;
    }
  }, [rpcState]);

  const items: TimelineItemProps[] = useMemo(
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
