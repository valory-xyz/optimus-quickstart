import { BigNumber, ethers, providers, utils } from "ethers";
export const useEthers = () => {
  /**
   * Returns the ETH balance of the given address
   * @param address string
   * @param rpc string
   * @returns Promise<number>
   */
  const getETHBalance = async (
    address: string,
    rpc: string,
  ): Promise<number> => {
    const provider = new providers.JsonRpcProvider(rpc, {
      name: "Gnosis",
      chainId: 100, // we currently only support Gnosis Trader agent
    });
    return provider
      .getBalance(address)
      .then((balance: BigNumber) => Number(utils.formatEther(balance)));
  };

  /**
   * Returns the ERC20 balance of the given address
   * @param address string
   * @param rpc string
   * @param contractAddress string
   * @returns Promise<number>
   */
  const getERC20Balance = async (
    address: string,
    rpc: string,
    contractAddress?: string,
  ): Promise<number> => {
    if (!contractAddress) return 0;
    const provider = new providers.JsonRpcProvider(rpc, {
      name: "Gnosis",
      chainId: 100, // we currently only support Gnosis Trader agent
    });
    const contract = new ethers.Contract(
      contractAddress,
      [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ],
      provider,
    );
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);
    return Number(utils.formatUnits(balance, decimals));
  };

  /**
   * Checks if the given RPC is valid
   * @param rpc string
   * @returns Promise<boolean>
   */
  const checkRPC = async (rpc: string): Promise<boolean> => {
    if (!rpc) return false;
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

  return { getETHBalance, checkRPC, getERC20Balance };
};
