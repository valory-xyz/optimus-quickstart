import { MULTICALL_CONTRACT } from "@/constants/contracts";
import { BigNumber, ethers } from "ethers";
import { Contract, Provider } from "ethers-multicall";
import { multicall3Abi } from "@/abi/multicall3Abi";

export const useMulticall = () => {
  const getETHBalances = async (
    addresses: string[],
    rpc: string,
  ): Promise<{ [address: string]: number }> => {
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const multicallProvider = new Provider(provider, 100);

    const multicallContract = new Contract(MULTICALL_CONTRACT, multicall3Abi);

    const callData = addresses.map((address) => {
      return multicallContract.getEthBalance(address);
    });

    return multicallProvider.all(callData).then((r: BigNumber[]) =>
      r.reduce(
        (
          acc: { [address: string]: number },
          balance: BigNumber,
          index: number,
        ) => ({
          ...acc,
          [addresses[index]]: parseFloat(ethers.utils.formatEther(balance)),
        }),
        {},
      ),
    );
  };

  return { getETHBalances };
};
