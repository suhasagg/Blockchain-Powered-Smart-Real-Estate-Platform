// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./PropertyShareToken.sol";
import "./PropertyNFT.sol";

/// @title PropertyFactory
/// @notice Registers verified properties, mints ownership NFT, and prepares ERC-1155 fractional share supply.
contract PropertyFactory is AccessControl, Pausable {
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    enum PropertyStatus { Draft, Active, Funded, Paused, Exited }

    struct PropertyInfo {
        uint256 id;
        string name;
        string location;
        uint256 totalShares;
        uint256 sharePrice; // payment token decimals or native wei depending marketplace setup
        uint256 mintedShares;
        address sponsor;
        uint256 nftId;
        bytes32 documentHash;
        string metadataURI;
        PropertyStatus status;
    }

    uint256 public nextPropertyId = 1;
    PropertyShareToken public immutable shareToken;
    PropertyNFT public immutable propertyNFT;
    mapping(uint256 => PropertyInfo) public properties;

    event PropertyCreated(uint256 indexed propertyId, string name, address indexed sponsor, uint256 totalShares, uint256 sharePrice, uint256 nftId, bytes32 documentHash, string metadataURI);
    event PropertyStatusUpdated(uint256 indexed propertyId, PropertyStatus status);
    event PropertyDocumentHashUpdated(uint256 indexed propertyId, bytes32 documentHash);

    constructor(address admin, PropertyShareToken _shareToken, PropertyNFT _propertyNFT) {
        shareToken = _shareToken;
        propertyNFT = _propertyNFT;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROPERTY_MANAGER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createProperty(
        string calldata name,
        string calldata location,
        uint256 totalShares,
        uint256 sharePrice,
        address sponsor,
        bytes32 documentHash,
        string calldata metadataURI
    ) external onlyRole(PROPERTY_MANAGER_ROLE) whenNotPaused returns (uint256 propertyId) {
        require(totalShares > 0, "totalShares=0");
        require(sharePrice > 0, "sharePrice=0");
        require(sponsor != address(0), "sponsor=0");

        propertyId = nextPropertyId++;
        uint256 nftId = propertyNFT.mint(sponsor, metadataURI);
        shareToken.setTokenURI(propertyId, metadataURI);

        properties[propertyId] = PropertyInfo({
            id: propertyId,
            name: name,
            location: location,
            totalShares: totalShares,
            sharePrice: sharePrice,
            mintedShares: 0,
            sponsor: sponsor,
            nftId: nftId,
            documentHash: documentHash,
            metadataURI: metadataURI,
            status: PropertyStatus.Active
        });

        emit PropertyCreated(propertyId, name, sponsor, totalShares, sharePrice, nftId, documentHash, metadataURI);
    }

    function reserveMintedShares(uint256 propertyId, uint256 amount) external onlyRole(PROPERTY_MANAGER_ROLE) {
        PropertyInfo storage p = properties[propertyId];
        require(p.status == PropertyStatus.Active, "not active");
        require(p.mintedShares + amount <= p.totalShares, "over supply");
        p.mintedShares += amount;
        if (p.mintedShares == p.totalShares) {
            p.status = PropertyStatus.Funded;
            emit PropertyStatusUpdated(propertyId, PropertyStatus.Funded);
        }
    }

    function mintShares(address to, uint256 propertyId, uint256 amount) external onlyRole(PROPERTY_MANAGER_ROLE) {
        shareToken.mint(to, propertyId, amount, "");
    }

    function setStatus(uint256 propertyId, PropertyStatus status) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(properties[propertyId].id != 0, "missing property");
        properties[propertyId].status = status;
        emit PropertyStatusUpdated(propertyId, status);
    }

    function updateDocumentHash(uint256 propertyId, bytes32 documentHash) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(properties[propertyId].id != 0, "missing property");
        properties[propertyId].documentHash = documentHash;
        emit PropertyDocumentHashUpdated(propertyId, documentHash);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
