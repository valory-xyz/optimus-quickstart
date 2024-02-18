import { useEthers } from "@/hooks";
import { Dispatch, SetStateAction } from "react";
import { FundRequirement } from "./FundRequirement";

export const FundRequirementERC20 = (props: {
  serviceHash: string;
  address: string;
  requirement: number;
  symbol: string;
  contractAddress?: string;
  setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
}) => {
  const { getERC20Balance } = useEthers();
  if (!props.contractAddress) return <></>;
  return <FundRequirement getBalance={getERC20Balance} {...props} />;
};
