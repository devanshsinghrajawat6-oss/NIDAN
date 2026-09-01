import { ethers } from "ethers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Function to get the contract ABI from hardhat artifacts
function getContractABI() {
  try {
    const artifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'CTMSLedger.sol', 'CTMSLedger.json');
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.abi;
    }
  } catch (error) {
    console.warn("Could not load CTMSLedger ABI. Please run `npx hardhat compile`.");
  }
  return []; // Return empty ABI fallback
}

/**
 * Simulates hashing and storing a record on the blockchain.
 * In a production Quorum/Ethereum environment, this connects via RPC.
 */
export async function storeOnBlockchain(recordId, dataJson, recordType, extraData = "") {
  // 1. Hash the JSON data (Data Minimisation & ALCOA+)
  const dataString = JSON.stringify(dataJson);
  const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

  // If a provider is configured (e.g., local Hardhat node or Quorum)
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  // If we don't have a private key or contract address, fallback to simulated logging
  if (!privateKey || !contractAddress) {
    console.log(`[BLOCKCHAIN SIMULATION] RecordAdded: ID=${recordId}, Hash=${dataHash}, Type=${recordType}`);
    // Return a fake transaction hash for MVP simulation purposes
    return `0xsimulated${crypto.randomBytes(26).toString('hex')}`;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const abi = getContractABI();
    
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Normalize recordId to clean string
    const idString = (typeof recordId === 'object' && recordId !== null)
      ? (recordId.patientId || recordId.trialId || recordId.eventId || recordId.milestoneId || recordId.deviationId || recordId.consentId || JSON.stringify(recordId))
      : String(recordId || 'RECORD');

    // Submit transaction to blockchain
    const tx = await contract.addRecord(idString, dataHash, String(recordType || 'AUDIT'), String(extraData || ''));
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    throw new Error("Failed to record on blockchain.");
  }
}
