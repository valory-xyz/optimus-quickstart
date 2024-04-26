const dotenv = require("dotenv");

dotenv.config();

/**@type import('hardhat/config').HardhatUserConfig */
const config = {
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.gnosis.gateway.fm",            
      },
      chainId: 100,
      hardfork: "cancun"      
    },    
  },    
};

module.exports = config