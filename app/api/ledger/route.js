import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

function getContractABI() {
  try {
    const artifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'CTMSLedger.sol', 'CTMSLedger.json');
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.abi;
    }
  } catch (error) {
    console.warn("Could not load CTMSLedger ABI.");
  }
  return [];
}

export async function GET() {
  try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
      return NextResponse.json({ success: false, error: 'Contract address not configured' }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const abi = getContractABI();
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Fetch past events
    const filter = contract.filters.RecordAdded();
    const logs = await contract.queryFilter(filter, 0, 'latest');

    const formattedEvents = logs.map(log => {
      // ethers v6 parses args in log.args
      return {
        txHash: log.transactionHash,
        recordId: log.args[0],
        dataHash: log.args[1],
        recordType: log.args[2],
        extraData: log.args[3],
        timestamp: new Date(Number(log.args[4]) * 1000).toISOString(),
        recordedBy: log.args[5],
        status: "Verified"
      };
    }).reverse(); // Newest first

    return NextResponse.json({ success: true, data: formattedEvents });
  } catch (error) {
    console.error('Blockchain Ledger API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
