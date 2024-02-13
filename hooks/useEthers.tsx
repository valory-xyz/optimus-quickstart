import { BigNumber, providers, utils } from "ethers";
export const useEthers = () => {
  const getETHBalance = (address: string, rpc: string): Promise<number> => {
    const provider = new providers.JsonRpcProvider(rpc, {
      name: "Gnosis",
      chainId: 100,
    });
    return provider
      .getBalance(address)
      .then((balance: BigNumber) => Number(utils.formatEther(balance)));
  };

  return { getETHBalance };
};
