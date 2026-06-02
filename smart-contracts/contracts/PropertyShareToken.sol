// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PropertyShareToken
/// @notice ERC-1155 fractional real-estate share token. Each property is one token id.
contract PropertyShareToken is ERC1155, ERC1155Supply, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    string public name;
    string public symbol;
    mapping(uint256 => string) private _tokenUris;

    event PropertyTokenURIUpdated(uint256 indexed propertyId, string tokenUri);

    constructor(string memory baseUri, address admin) ERC1155(baseUri) {
        name = "Real Estate Fractional Shares";
        symbol = "REFS";
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function setTokenURI(uint256 propertyId, string calldata tokenUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenUris[propertyId] = tokenUri;
        emit PropertyTokenURIUpdated(propertyId, tokenUri);
    }

    function uri(uint256 propertyId) public view override returns (string memory) {
        string memory specific = _tokenUris[propertyId];
        if (bytes(specific).length > 0) return specific;
        return super.uri(propertyId);
    }

    function mint(address to, uint256 propertyId, uint256 amount, bytes calldata data) external onlyRole(MINTER_ROLE) {
        _mint(to, propertyId, amount, data);
    }

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external onlyRole(MINTER_ROLE) {
        _mintBatch(to, ids, amounts, data);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
