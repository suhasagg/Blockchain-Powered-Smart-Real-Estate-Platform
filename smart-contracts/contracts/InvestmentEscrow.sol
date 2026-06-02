// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./PropertyFactory.sol";

/// @title InvestmentEscrow
/// @notice Primary market investment flow. Accepts native ETH or an ERC-20 stablecoin and mints property shares.
contract InvestmentEscrow is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    PropertyFactory public immutable factory;
    IERC20 public immutable paymentToken; // address(0) means native ETH mode is used through investNative
    address public treasury;
    uint256 public platformFeeBps;
    uint256 public constant BPS = 10_000;

    mapping(uint256 => mapping(address => uint256)) public investedByProperty;

    event InvestmentCompleted(uint256 indexed propertyId, address indexed investor, uint256 shares, uint256 grossAmount, uint256 platformFee, address paymentToken);
    event TreasuryUpdated(address indexed treasury);
    event PlatformFeeUpdated(uint256 feeBps);

    constructor(address admin, PropertyFactory _factory, IERC20 _paymentToken, address _treasury, uint256 _platformFeeBps) {
        require(_treasury != address(0), "treasury=0");
        require(_platformFeeBps <= 1000, "fee too high");
        factory = _factory;
        paymentToken = _paymentToken;
        treasury = _treasury;
        platformFeeBps = _platformFeeBps;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TREASURY_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function investWithToken(uint256 propertyId, uint256 shares) external nonReentrant whenNotPaused {
        require(address(paymentToken) != address(0), "token disabled");
        uint256 gross = _grossCost(propertyId, shares);
        uint256 fee = (gross * platformFeeBps) / BPS;
        paymentToken.safeTransferFrom(msg.sender, treasury, gross);
        _finalizeInvestment(propertyId, msg.sender, shares, gross, fee, address(paymentToken));
    }

    function investNative(uint256 propertyId, uint256 shares) external payable nonReentrant whenNotPaused {
        require(address(paymentToken) == address(0), "native disabled");
        uint256 gross = _grossCost(propertyId, shares);
        require(msg.value == gross, "bad msg.value");
        uint256 fee = (gross * platformFeeBps) / BPS;
        (bool ok,) = treasury.call{value: gross}("");
        require(ok, "treasury transfer failed");
        _finalizeInvestment(propertyId, msg.sender, shares, gross, fee, address(0));
    }

    function _grossCost(uint256 propertyId, uint256 shares) internal view returns (uint256) {
        require(shares > 0, "shares=0");
        (, , , uint256 totalShares, uint256 sharePrice, uint256 mintedShares, , , , , PropertyFactory.PropertyStatus status) = factory.properties(propertyId);
        require(status == PropertyFactory.PropertyStatus.Active, "not active");
        require(mintedShares + shares <= totalShares, "sold out");
        return sharePrice * shares;
    }

    function _finalizeInvestment(uint256 propertyId, address investor, uint256 shares, uint256 gross, uint256 fee, address payToken) internal {
        factory.reserveMintedShares(propertyId, shares);
        factory.mintShares(investor, propertyId, shares);
        investedByProperty[propertyId][investor] += gross;
        emit InvestmentCompleted(propertyId, investor, shares, gross, fee, payToken);
    }

    function setTreasury(address _treasury) external onlyRole(TREASURY_ROLE) {
        require(_treasury != address(0), "treasury=0");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setPlatformFeeBps(uint256 _feeBps) external onlyRole(TREASURY_ROLE) {
        require(_feeBps <= 1000, "fee too high");
        platformFeeBps = _feeBps;
        emit PlatformFeeUpdated(_feeBps);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
