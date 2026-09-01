# Hyperledger Fabric Blockchain Setup Guide

This guide outlines the steps needed to transition NIDANA from a simulated blockchain (currently in `bAckend/blockchain/ledger.js`) to a production-ready distributed ledger network.

## Option 1: Hyperledger Fabric (Recommended for Enterprise CTMS)

Hyperledger Fabric is ideal for healthcare compliance because it supports private "channels" and granular access control for different organizations (e.g., Regulators, Hospitals, Sponsors).

### Prerequisites
1.  **Docker & Docker Compose**: Required for running peer nodes and orderers.
2.  **Go or Node.js**: For writing the chaincode (smart contracts).
3.  **Fabric binaries and Docker images**: Download via `curl -sSL https://bit.ly/2ysbOFE | bash -s`.

### Setup Steps
1.  **Network Architecture**: Define your organizations (e.g., `GovRegulatorMSP`, `TrialSponsorMSP`, `HospitalSiteAMSP`) in a `crypto-config.yaml` file.
2.  **Generate Certificates**: Use `cryptogen` tool to generate X.509 certificates for all nodes and admins.
3.  **Create Genesis Block & Channel**: Use `configtxgen` to create the orderer genesis block and the channel configuration transaction.
4.  **Start the Network**: Use Docker Compose to bring up the Orderer node, Peer nodes, and Certificate Authorities (CAs).
5.  **Deploy Chaincode**: 
    *   Write a smart contract (e.g., `PatientConsentContract`) to handle `RecordConsent` and `VerifyTrialMilestone`.
    *   Package and install the chaincode on peers.
    *   Approve and commit the chaincode definition on the channel.
6.  **Backend Integration**: Replace the existing Next.js simulated ledger API with the `@hyperledger/fabric-gateway` SDK to submit transactions to the real network.

---

## Option 2: Public/Consortium EVM (e.g., Polygon Edge or Hyperledger Besu)

If you prefer a Solidity-based approach, you can set up a private Ethereum-compatible network.

### Setup Steps
1.  **Deploy a Private Network**: Use Hyperledger Besu or Polygon Edge to spin up a small validator network (IBFT 2.0 consensus is recommended for speed and finality).
2.  **Write Smart Contracts**: Create `TrialCompliance.sol` to store IPFS hashes of patient consent documents and trial milestones.
3.  **Deploy Contracts**: Use Hardhat or Truffle to deploy the contracts to your private network.
4.  **Backend Integration**: Use `ethers.js` in your Next.js `/api` routes to interact with the deployed contracts.
    *   Store large JSON data in MongoDB.
    *   Hash the JSON data (`SHA-256`) and store only the hash on the blockchain as proof of integrity.
