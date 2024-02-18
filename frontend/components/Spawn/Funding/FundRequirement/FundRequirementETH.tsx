import { useEthers } from "@/hooks";
import { Dispatch, SetStateAction } from "react";
import { FundRequirement } from "./FundRequirement";

export const FundRequirementETH = (props: {
  setReceivedFunds: Dispatch<SetStateAction<{ [address: string]: boolean }>>;
  serviceHash?: string;
  address: string;
  symbol: string;
  requirement: number;
}) => {
  const { getETHBalance } = useEthers();
  return <FundRequirement getBalance={getETHBalance} {...props} />;
};
