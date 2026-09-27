export const CTMS_LEDGER_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "recordId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "dataHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "recordType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "extraData",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recordedBy",
        "type": "address"
      }
    ],
    "name": "RecordAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_recordId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_dataHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_recordType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_extraData",
        "type": "string"
      }
    ],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_recordId",
        "type": "string"
      }
    ],
    "name": "getRecords",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "recordId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "dataHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "recordType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "extraData",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "recordedBy",
            "type": "address"
          }
        ],
        "internalType": "struct CTMSLedger.AuditRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
