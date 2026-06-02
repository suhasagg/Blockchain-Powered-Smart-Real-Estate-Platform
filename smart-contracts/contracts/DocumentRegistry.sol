// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title DocumentRegistry
/// @notice Stores on-chain hashes for off-chain legal, valuation, KYC-safe, audit, and property documents.
contract DocumentRegistry is AccessControl {
    bytes32 public constant DOCUMENT_MANAGER_ROLE = keccak256("DOCUMENT_MANAGER_ROLE");

    struct DocumentRecord {
        uint256 propertyId;
        bytes32 documentHash;
        string documentType;
        string uri;
        uint256 createdAt;
        address uploadedBy;
    }

    uint256 public nextDocumentId = 1;
    mapping(uint256 => DocumentRecord) public documents;
    mapping(uint256 => uint256[]) public propertyDocuments;

    event DocumentRegistered(uint256 indexed documentId, uint256 indexed propertyId, bytes32 documentHash, string documentType, string uri, address indexed uploadedBy);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DOCUMENT_MANAGER_ROLE, admin);
    }

    function registerDocument(uint256 propertyId, bytes32 documentHash, string calldata documentType, string calldata uri)
        external
        onlyRole(DOCUMENT_MANAGER_ROLE)
        returns (uint256 documentId)
    {
        require(documentHash != bytes32(0), "hash=0");
        documentId = nextDocumentId++;
        documents[documentId] = DocumentRecord(propertyId, documentHash, documentType, uri, block.timestamp, msg.sender);
        propertyDocuments[propertyId].push(documentId);
        emit DocumentRegistered(documentId, propertyId, documentHash, documentType, uri, msg.sender);
    }

    function getPropertyDocuments(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyDocuments[propertyId];
    }
}
