import "@nomicfoundation/hardhat-toolbox";
import fs from "fs";
import path from "path";

// Simple helper to load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        const val = vals.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val.trim();
        }
      }
    }
  }
} catch (e) {
  // Ignore
}

const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: privateKey
    },
    amoy: {
      url: process.env.BLOCKCHAIN_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: privateKey
    },
    custom: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
      accounts: privateKey
    }
  }
};

export default config;
