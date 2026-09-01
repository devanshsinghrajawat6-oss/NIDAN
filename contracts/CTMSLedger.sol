// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CTMSLedger {
    address public owner;

    struct AuditRecord {
        string recordId;       // e.g., Patient ID or Trial ID
        string dataHash;       // SHA-256 hash of the JSON data (e.g., consent form or milestone details)
        string recordType;     // e.g., "CONSENT", "MILESTONE", "AE_REPORT"
        string extraData;      // Immutable clinical data (e.g., dosage)
        uint256 timestamp;
        address recordedBy;
    }

    mapping(string => AuditRecord[]) private records;

    event RecordAdded(string indexed recordId, string dataHash, string recordType, string extraData, uint256 timestamp, address recordedBy);

    constructor() {
        owner = msg.sender;
    }

    // Stores an immutable hash of a CTMS record for ALCOA+ compliance
    function addRecord(string memory _recordId, string memory _dataHash, string memory _recordType, string memory _extraData) public {
        AuditRecord memory newRecord = AuditRecord({
            recordId: _recordId,
            dataHash: _dataHash,
            recordType: _recordType,
            extraData: _extraData,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        });

        records[_recordId].push(newRecord);
        emit RecordAdded(_recordId, _dataHash, _recordType, _extraData, block.timestamp, msg.sender);
    }

    // Retrieve all audit logs for a specific record ID
    function getRecords(string memory _recordId) public view returns (AuditRecord[] memory) {
        return records[_recordId];
    }
}
