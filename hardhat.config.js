const dotenv = require("dotenv");

dotenv.config();

/**@type import('hardhat/config').HardhatUserConfig */
const config = {
  defaultNetwork: "hardhat",
  networks: {    
    hardhat: {
      forking: {
        url: "https://gnosis-pokt.nodies.app"      
      },
      chainId: 100,
    },    
  },    
};

module.exports = config