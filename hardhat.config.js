const dotenv = require("dotenv");

dotenv.config();

/**@type import('hardhat/config').HardhatUserConfig */
const config = {
  networks: {
    hardhat: {
      forking: {
        url: "https://gnosis-pokt.nodies.app"
      },
    },    
  },    
};

module.exports = config