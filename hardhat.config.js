import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.28",
  networks: {
    // For production, you would configure your Quorum (ConsenSys) RPC URL here:
    // quorum: {
    //   url: "http://<quorum-node-ip>:8545",
    //   accounts: ["<private-key>"]
    // }
  }
};

export default config;
