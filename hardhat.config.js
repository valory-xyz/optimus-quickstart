// temporary during development
require("dotenv").config();
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: { url: process.env.FORK_URL },
      chainId: process.env.CHAIN_ID || 100,
      port: process.env.PORT || 8545,
    },
  },

};
