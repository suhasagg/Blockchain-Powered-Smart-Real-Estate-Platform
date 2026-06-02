// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title SecondaryMarketplace
/// @notice Lists, locks, buys, and cancels fractional property shares.
contract SecondaryMarketplace is AccessControl, ReentrancyGuard, Pausable, IERC1155Receiver {
    using SafeERC20 for IERC20;

    bytes32 public constant MARKET_ADMIN_ROLE = keccak256("MARKET_ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public constant BPS = 10_000;

    struct Listing {
        uint256 id;
        address seller;
        uint256 propertyId;
        uint256 shares;
        uint256 pricePerShare;
        address paymentToken; // address(0) for native ETH
        bool active;
    }

    IERC1155 public immutable shareToken;
    address public feeRecipient;
    uint256 public feeBps;
    uint256 public nextListingId = 1;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed seller, uint256 indexed propertyId, uint256 shares, uint256 pricePerShare, address paymentToken);
    event Purchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 shares, uint256 grossAmount, uint256 fee);
    event Cancelled(uint256 indexed listingId);
    event FeeConfigUpdated(address indexed feeRecipient, uint256 feeBps);

    constructor(address admin, IERC1155 _shareToken, address _feeRecipient, uint256 _feeBps) {
        require(_feeRecipient != address(0), "feeRecipient=0");
        require(_feeBps <= 1000, "fee too high");
        shareToken = _shareToken;
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MARKET_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function list(uint256 propertyId, uint256 shares, uint256 pricePerShare, address paymentToken) external whenNotPaused returns (uint256 listingId) {
        require(shares > 0, "shares=0");
        require(pricePerShare > 0, "price=0");
        shareToken.safeTransferFrom(msg.sender, address(this), propertyId, shares, "");
        listingId = nextListingId++;
        listings[listingId] = Listing(listingId, msg.sender, propertyId, shares, pricePerShare, paymentToken, true);
        emit Listed(listingId, msg.sender, propertyId, shares, pricePerShare, paymentToken);
    }

    function buy(uint256 listingId, uint256 shares) external payable nonReentrant whenNotPaused {
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        require(shares > 0 && shares <= l.shares, "bad shares");
        uint256 gross = l.pricePerShare * shares;
        uint256 fee = (gross * feeBps) / BPS;
        uint256 sellerAmount = gross - fee;

        if (l.paymentToken == address(0)) {
            require(msg.value == gross, "bad msg.value");
            (bool okFee,) = feeRecipient.call{value: fee}("");
            require(okFee, "fee failed");
            (bool okSeller,) = l.seller.call{value: sellerAmount}("");
            require(okSeller, "seller failed");
        } else {
            require(msg.value == 0, "native not accepted");
            IERC20(l.paymentToken).safeTransferFrom(msg.sender, feeRecipient, fee);
            IERC20(l.paymentToken).safeTransferFrom(msg.sender, l.seller, sellerAmount);
        }

        l.shares -= shares;
        if (l.shares == 0) l.active = false;
        shareToken.safeTransferFrom(address(this), msg.sender, l.propertyId, shares, "");
        emit Purchased(listingId, msg.sender, l.seller, shares, gross, fee);
    }

    function cancel(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "inactive");
        require(msg.sender == l.seller || hasRole(MARKET_ADMIN_ROLE, msg.sender), "not allowed");
        l.active = false;
        uint256 remaining = l.shares;
        l.shares = 0;
        shareToken.safeTransferFrom(address(this), l.seller, l.propertyId, remaining, "");
        emit Cancelled(listingId);
    }

    function setFeeConfig(address _feeRecipient, uint256 _feeBps) external onlyRole(MARKET_ADMIN_ROLE) {
        require(_feeRecipient != address(0), "feeRecipient=0");
        require(_feeBps <= 1000, "fee too high");
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
        emit FeeConfigUpdated(_feeRecipient, _feeBps);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl, IERC165) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}
