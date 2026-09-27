# 🌿 NIDANA — Decentralized Clinical Trial & Herbal Traceability Platform

> **Clinical Insight & Natural Precision**  
> An enterprise-grade, blockchain-enabled Clinical Trial Management System (CTMS) and Herbal Product Traceability platform designed for ALCOA+ data integrity, GCP regulatory compliance, patient eConsent, real-time safety monitoring, and seamless clinical data export.

---

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.29.1-FFF100?style=for-the-badge&logo=hardhat)](https://hardhat.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Seeding](#database-seeding)
  - [Blockchain Setup & Smart Contract Deployment](#blockchain-setup--smart-contract-deployment)
- [NPM Scripts Reference](#-npm-scripts-reference)
- [ALCOA+ Compliance & Blockchain Audit Ledger](#-alcoa-compliance--blockchain-audit-ledger)
- [Interoperability & Data Formats](#-interoperability--data-formats)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Overview

**NIDANA** marries scientific rigor with natural wellness by bridging traditional clinical trials with modern decentralized auditability. Built specifically for clinical research institutions, pharmaceutical organizations, and botanical formulation manufacturers, NIDANA provides cryptographic proof of data integrity for every patient consent, milestone update, adverse event report, and herbal supply batch.

### Why NIDANA?
- **Cryptographic Auditability:** Hashes patient consent and trial milestones directly to an immutable EVM smart contract (`CTMSLedger.sol`) for ALCOA+ (Attributable, Legible, Contemporaneous, Original, Accurate) compliance.
- **Botanical Supply Traceability:** Farm-to-formulation tracking for natural health products and traditional medicine trials.
- **Standardized Interoperability:** Native exports for CDISC SDTM, ADaM, Define-XML, and HL7 FHIR R4 API endpoints.
- **Enterprise-Ready UX:** Built with Next.js 16 App Router, dark/light mode toggle, dynamic analytics charts, and responsive UI components.

---

## ✨ Key Features & Modules

### 1. 📊 Executive Dashboard (`/dashboard`)
- **Key Metrics:** Live tracking of active trials, enrolled patients, GCP audit scores, pending consent forms, and safety alerts.
- **Visual Analytics:** Interactive enrollment trends, site performance metrics, and compliance distribution powered by Recharts.

### 2. 📑 Clinical Trial Management (`/dashboard/trials`)
- **Study Lifecycle:** Manage Phase I–IV trials, study protocols, participating sites, and investigator assignments.
- **Milestone Verification:** Track study milestones (IRB approval, first patient in, data lock) with blockchain cryptographic proofs.

### 3. 👥 Patient Onboarding & eConsent (`/dashboard/patients`, `/dashboard/consent`)
- **Digital Consent:** Cryptographically signed electronic consent (eConsent) forms with dynamic withdrawal tracking.
- **Version Control:** Automatic versioning of informed consent documents ensuring patients always review current IRB-approved versions.

### 4. 🚨 Safety & Adverse Event Monitoring (`/dashboard/safety`)
- **AE/SAE Logging:** Real-time adverse event reporting with severity metrics, causality assessments, and regulatory notification workflows.
- **Compensation Tracker:** Track participant safety compensation and medical follow-up requirements.

### 5. 🌿 Herbal & Botanical Traceability (`/dashboard/traceability`)
- **Farm-to-Formulation:** Trace raw botanical ingredients from cultivation source to final dosage form.
- **Batch Verification & Recall:** Generate batch QR codes, verify active compound stability, and execute targeted recall workflows if needed.

### 6. 🛡️ Blockchain Audit Ledger (`/dashboard/ledger`, `/dashboard/audit`)
- **Immutable Log:** Every critical action generates a SHA-256 fingerprint anchored on the `CTMSLedger` smart contract.
- **Tamper Detection:** Compare live database state against on-chain hashes to instantly detect unauthorized modifications.

### 7. ⚖️ GCP Compliance & Deviations (`/dashboard/gcp-checklist`)
- **GCP Guidelines:** Interactive compliance checklist covering ICH E6(R2) standards.
- **Deviation Logging:** Document protocol deviations, root cause analysis (RCA), and Corrective and Preventive Actions (CAPA).

### 8. 📁 Data Analytics & Export (`/dashboard/analytics`, `/dashboard/export`)
- **CDISC SDTM / ADaM:** Export clinical trial datasets compliant with FDA/EMA regulatory submission standards.
- **HL7 FHIR Interoperability:** Integrated REST endpoints (`/api/fhir/[resource]`) for seamless EHR integration.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────┐
                               │           Next.js 16 Client            │
                               │   (Dashboard, eConsent, Traceability)  │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │         Next.js App Router API         │
                               │  (/api/patients, /api/safety, etc.)    │
                               └──────────┬──────────────────┬──────────┘
                                          │                  │
                                          ▼                  ▼
              ┌───────────────────────────────┐   ┌───────────────────────────────┐
              │       MongoDB / Mongoose      │   │     EVM Blockchain Ledger     │
              │   (Clinical & Patient Data)   │   │ (CTMSLedger.sol / Hardhat)    │
              └───────────────────────────────┘   └───────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Next-Themes](https://github.com/pacocoursey/next-themes)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) & `bcryptjs`
- **Smart Contracts & Web3:** [Solidity 0.8.20](https://soliditylang.org/), [Hardhat](https://hardhat.org/), [Ethers.js v6](https://docs.ethers.org/v6/)
- **Standards:** CDISC SDTM/ADaM, HL7 FHIR R4, ICH GCP E6(R2)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas connection string.

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akshay-Kumar-Sharma7807/nidana.git
   cd nidana
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nidana

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Blockchain Configuration (Hardhat Local / Sepolia / Amoy)
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=localhost
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

### Database Seeding

Populate the database with sample trials, patient records, safety reports, and herbal traceability batches:

```bash
npm run seed
```

---

### Blockchain Setup & Smart Contract Deployment

1. **Start the local Hardhat blockchain node:**
   ```bash
   npm run blockchain:node
   ```

2. **Deploy the `CTMSLedger` smart contract:**
   ```bash
   npm run blockchain:deploy
   ```

3. *(Optional)* **Deploy to testnets:**
   ```bash
   # Sepolia Testnet
   npm run blockchain:deploy:sepolia

   # Polygon Amoy Testnet
   npm run blockchain:deploy:amoy
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 NPM Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Launches the Next.js development server |
| `npm run build` | `next build` | Compiles the production build |
| `npm run start` | `next start` | Starts the production server |
| `npm run lint` | `eslint` | Runs ESLint code quality checks |
| `npm run seed` | `node scripts/seed_database.js` | Seeds MongoDB with test clinical data |
| `npm run blockchain:node` | `hardhat node` | Spins up a local Ethereum dev node |
| `npm run blockchain:deploy` | `hardhat run scripts/deploy.js --network localhost` | Deploys `CTMSLedger.sol` to local node |
| `npm run blockchain:deploy:sepolia` | `hardhat run scripts/deploy.js --network sepolia` | Deploys contract to Sepolia testnet |
| `npm run blockchain:deploy:amoy` | `hardhat run scripts/deploy.js --network amoy` | Deploys contract to Polygon Amoy testnet |
| `npm run blockchain:show` | `node scripts/show_blockchain_data.js` | Queries on-chain audit records |

---

## 🔒 ALCOA+ Compliance & Blockchain Audit Ledger

NIDANA enforces regulatory compliance under FDA 21 CFR Part 11 and ICH GCP E6(R2) guidelines:

1. **Attributable:** Every record modification stores the digital signature and wallet address (`recordedBy`).
2. **Legible:** Data stored in structured JSON schema with standardized audit log viewer.
3. **Contemporaneous:** Block timestamp (`block.timestamp`) automatically anchors the exact time of entry.
4. **Original & Accurate:** SHA-256 hashes generated prior to database writes are posted on-chain. Any subsequent database tampering invalidates the hash check.

### Smart Contract Interface (`CTMSLedger.sol`)

```solidity
struct AuditRecord {
    string recordId;       // e.g., Patient ID, Trial ID, or Batch ID
    string dataHash;       // SHA-256 hash of JSON record
    string recordType;     // "CONSENT", "MILESTONE", "AE_REPORT", "TRACEABILITY"
    string extraData;      // Additional metadata (dosage, site ID)
    uint256 timestamp;     // Block timestamp
    address recordedBy;    // Ethereum account address
}
```

---

## 🌐 Interoperability & Data Formats

- **CDISC SDTM / ADaM:** Export standardized datasets (`/api/export/sdtm`, `/api/export/adam`) for regulatory submission packages.
- **HL7 FHIR R4:** Fetch patient, trial, and observation data via standardized REST endpoints (`/api/fhir/Patient`, `/api/fhir/ResearchStudy`).
- **Define-XML:** Generate XML metadata definitions for clinical trial datasets (`/api/export/define-xml`).

---

## 📂 Project Structure

```
Nidana/
├── app/
│   ├── api/                   # REST API routes (auth, patients, safety, export, fhir, ledger)
│   ├── components/            # Reusable UI components & providers
│   ├── dashboard/             # Dashboard views (analytics, audit, consent, gcp, safety, etc.)
│   ├── login/                 # Login authentication page
│   ├── globals.css            # Custom CSS & Tailwind configuration
│   ├── layout.tsx             # Root layout & providers
│   └── page.tsx               # Landing page
├── contracts/
│   └── CTMSLedger.sol         # Solidity smart contract for audit logging
├── lib/                       # Helper libraries (db, blockchain, fhir, encryption, kpi)
├── scripts/                   # Database seeding & smart contract deployment scripts
├── BLOCKCHAIN_SETUP_GUIDE.md  # Guide for production Hyperledger / EVM network setup
├── DESIGN.md                  # Comprehensive design system specification
├── hardhat.config.js          # Hardhat Web3 configuration
├── package.json               # Dependencies & npm scripts
└── tsconfig.json              # TypeScript configuration
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
