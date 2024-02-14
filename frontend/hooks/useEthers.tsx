import { BigNumber, providers, utils } from "ethers";
export const useEthers = () => {
  /**
   * Returns the ETH balance of the given address
   * @param address string
   * @param rpc string
   * @returns Promise<number>
   */
  const getETHBalance = (address: string, rpc: string): Promise<number> => {
    const provider = new providers.JsonRpcProvider(rpc, {
      name: "Gnosis",
      chainId: 100, // we currently only support Gnosis Trader agent
    });
    return provider
      .getBalance(address)
      .then((balance: BigNumber) => Number(utils.formatEther(balance)));
  };

  /**
   * Checks if the given RPC is valid
   * @param rpc string
   * @returns Promise<boolean>
   */
  const checkRPC = async (rpc: string): Promise<boolean> => {
    const provider = new providers.JsonRpcProvider(rpc, {
      name: "Gnosis",
      chainId: 100, // we currently only support Gnosis Trader agent
    });
    try {
      const networkId = (await provider.getNetwork()).chainId;
      if (networkId) return true;
    } catch (e) {
      return false;
    }
    return false;
  };

  return { getETHBalance, checkRPC };
};
