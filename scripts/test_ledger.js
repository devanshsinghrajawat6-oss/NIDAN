import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// Extract env vars manually since this is a simple node script
const envLocal = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const contractAddressMatch = envLocal.match(/CONTRACT_ADDRESS="(.*)"/);
const privateKeyMatch = envLocal.match(/BLOCKCHAIN_PRIVATE_KEY="(.*)"/);

const CONTRACT_ADDRESS = contractAddressMatch ? contractAddressMatch[1] : "";
const PRIVATE_KEY = privateKeyMatch ? privateKeyMatch[1] : "";

async function main() {
    console.log("===============================================");
    console.log("🔍 Fetching data from local Hardhat blockchain");
    console.log("===============================================\n");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const artifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'CTMSLedger.sol', 'CTMSLedger.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

    console.log("Adding a sample record to the ledger...");
    const tx = await contract.addRecord(
        "TEST-PATIENT-001",
        "0xabc123hashofconsentform",
        "CONSENT_SUBMISSION"
    );
    await tx.wait();
    console.log(`✅ Record added! Tx Hash: ${tx.hash}\n`);

    console.log("Reading all logs from the blockchain...\n");
    const filter = contract.filters.RecordAdded();
    const logs = await contract.queryFilter(filter, 0, 'latest');

    if (logs.length === 0) {
        console.log("No records found.");
    } else {
        logs.forEach((log, index) => {
            console.log(`--- Record #${index + 1} ---`);
            console.log(`Transaction Hash: ${log.transactionHash}`);
            console.log(`Record ID:        ${log.args[0]}`);
            console.log(`Data Hash:        ${log.args[1]}`);
            console.log(`Record Type:      ${log.args[2]}`);
            console.log(`Timestamp:        ${new Date(Number(log.args[3]) * 1000).toLocaleString()}`);
            console.log(`Recorded By:      ${log.args[4]}`);
            console.log("-------------------\n");
        });
    }
}

main().catch(console.error);
