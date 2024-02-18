import { useEthers } from "@/hooks";
import { Dispatch, SetStateAction } from "react";
import { FundRequirement } from "./FundRequirement";

export const FundRequirementERC20 = (props: {
  serviceHash: string;
  address: string;
  requirement: number;
  symbol: string;
  contractAddress?: string;
  hasReceivedFunds: boolean;
  setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
}) => {
  const { getERC20Balance } = useEthers();
  return (
    <FundRequirement getBalance={getERC20Balance} isERC20={true} {...props} />
  );
};
