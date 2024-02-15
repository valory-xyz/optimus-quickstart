// temporary during development
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {url: "https://lb.nodies.app/v1/406d8dcc043f4cb3959ed7d6673d311a"},
      chainId: 100,
    },
  },
};
