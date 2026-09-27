# NIDANA CTMS: Vercel & Real Blockchain Deployment Guide

This guide walks you through deploying **NIDANA CTMS** to **Vercel** with **Real EVM Blockchain Integration** (Ethereum Sepolia, Polygon Amoy, or custom private node).

---

## 🏗️ Architecture Overview

1. **Next.js App Router Frontend & API**: Hosted on Vercel Serverless.
2. **MongoDB Atlas**: Production database storing full clinical records.
3. **Smart Contract (`CTMSLedger.sol`)**: Deployed to an EVM-compatible blockchain. Stores cryptographic hashes (`SHA-256`) of patient consent, trial milestones, and audit trails for ALCOA+ compliance.
4. **Serverless Blockchain Relayer**: Next.js API endpoints (`/api/ledger`, `/api/consent`, `/api/compliance/check`, etc.) interact directly with the smart contract using `ethers.js` and the bundled `CTMS_LEDGER_ABI`.

---

## ⚡ Step 1: Deploy Smart Contract to Real Blockchain Network

Before deploying to Vercel, deploy your smart contract (`contracts/CTMSLedger.sol`) to a real EVM blockchain (e.g. Sepolia testnet or Polygon Amoy).

### Prerequisites
- A wallet private key with testnet ETH (for Sepolia) or MATIC (for Polygon Amoy).
- An RPC URL (e.g., Infura, Alchemy, QuickNode, or free public RPC).

### Option A: Deploy to Ethereum Sepolia Testnet
Set your environment variables and deploy:
```bash
# Set environment variables in your terminal (PowerShell example)
$env:BLOCKCHAIN_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
$env:BLOCKCHAIN_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"

# Run deployment script
npm run blockchain:deploy:sepolia
```

### Option B: Deploy to Polygon Amoy Testnet
```bash
$env:BLOCKCHAIN_PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
$env:BLOCKCHAIN_RPC_URL="https://rpc-amoy.polygon.technology"

npm run blockchain:deploy:amoy
```

> **Note the deployed contract address output!**  
> Example: `CTMSLedger deployed to: 0x1234567890abcdef1234567890abcdef12345678`

---

## 🚀 Step 2: Deploy Next.js Application to Vercel

### Option 1: Deploying via Vercel CLI (Recommended)

1. Open your terminal in the project directory:
   ```bash
   npx vercel
   ```
2. Follow the prompts:
   - **Set up and deploy?** `Y`
   - **Which scope?** Select your Vercel account/team.
   - **Link to existing project?** `N`
   - **Project Name:** `nidana-ctms` (or preferred name)
   - **In which directory is your code located?** `./`
   - **Want to modify build settings?** `N`

3. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

### Option 2: Deploying via GitHub / Vercel Dashboard

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure Vercel build and real blockchain integration"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Click **Import Project** and select your repository.
   - Framework Preset: **Next.js**
   - Root Directory: `./`

---

## 🔑 Step 3: Configure Vercel Environment Variables

In your Vercel Project Settings -> **Environment Variables**, add the following keys for **Production**, **Preview**, and **Development**:

| Variable Name | Description | Example Value |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:password@cluster.mongodb.net/nidana` |
| `BLOCKCHAIN_RPC_URL` | Live EVM Blockchain RPC Node URL | `https://ethereum-sepolia-rpc.publicnode.com` |
| `BLOCKCHAIN_PRIVATE_KEY` | Wallet private key with gas to sign transactions | `0x1234567890abcdef...` |
| `CONTRACT_ADDRESS` | Deployed `CTMSLedger` smart contract address | `0x1234567890abcdef1234567890abcdef12345678` |

---

## ✅ Step 4: Verification & Live Health Check

Once deployed, test your live production endpoint:

1. **Blockchain Ledger Dashboard**: Visit `https://your-app.vercel.app/dashboard/ledger` to view live on-chain logs.
2. **System Health Check**: Visit `https://your-app.vercel.app/dashboard/gcp-checklist` to trigger a real-time compliance check across MongoDB schemas and the EVM Smart Contract.
3. **API Endpoint Verification**:
   - `GET /api/ledger`: Queries live `RecordAdded` events directly from the blockchain contract.
   - `POST /api/compliance/check`: Validates contract bytecode on-chain and logs transaction counts.

---

## 🛠️ Fallback Simulation Mode
If `BLOCKCHAIN_PRIVATE_KEY` or `CONTRACT_ADDRESS` is omitted from Vercel environment variables, NIDANA will gracefully operate in **Deterministic Audit Trail Simulation Mode** so your app never crashes in demonstration environments.
