// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title RentalDistribution
/// @notice Deposits monthly net rental income and lets token holders claim proportionally.
contract RentalDistribution is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant PAYOUT_MANAGER_ROLE = keccak256("PAYOUT_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public nextRoundId = 1;

    struct PayoutRound {
        uint256 id;
        uint256 propertyId;
        address paymentToken; // address(0) native ETH
        uint256 amount;
        uint256 totalSharesSnapshot;
        string reportURI;
        bool active;
    }

    IERC1155 public immutable shareToken;
    mapping(uint256 => PayoutRound) public rounds;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event PayoutDeposited(uint256 indexed roundId, uint256 indexed propertyId, address paymentToken, uint256 amount, uint256 totalSharesSnapshot, string reportURI);
    event PayoutClaimed(uint256 indexed roundId, address indexed investor, uint256 amount);

    constructor(address admin, IERC1155 _shareToken) {
        shareToken = _shareToken;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAYOUT_MANAGER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function depositTokenPayout(uint256 propertyId, IERC20 paymentToken, uint256 amount, uint256 totalSharesSnapshot, string calldata reportURI)
        external
        nonReentrant
        whenNotPaused
        onlyRole(PAYOUT_MANAGER_ROLE)
        returns (uint256 roundId)
    {
        require(address(paymentToken) != address(0), "token=0");
        require(amount > 0 && totalSharesSnapshot > 0, "bad payout");
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        roundId = _createRound(propertyId, address(paymentToken), amount, totalSharesSnapshot, reportURI);
    }

    function depositNativePayout(uint256 propertyId, uint256 totalSharesSnapshot, string calldata reportURI)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyRole(PAYOUT_MANAGER_ROLE)
        returns (uint256 roundId)
    {
        require(msg.value > 0 && totalSharesSnapshot > 0, "bad payout");
        roundId = _createRound(propertyId, address(0), msg.value, totalSharesSnapshot, reportURI);
    }

    function claim(uint256 roundId) external nonReentrant whenNotPaused {
        PayoutRound memory r = rounds[roundId];
        require(r.active, "inactive");
        require(!claimed[roundId][msg.sender], "claimed");
        uint256 holderShares = shareToken.balanceOf(msg.sender, r.propertyId);
        require(holderShares > 0, "no shares");
        uint256 amount = (r.amount * holderShares) / r.totalSharesSnapshot;
        claimed[roundId][msg.sender] = true;
        if (r.paymentToken == address(0)) {
            (bool ok,) = msg.sender.call{value: amount}("");
            require(ok, "native transfer failed");
        } else {
            IERC20(r.paymentToken).safeTransfer(msg.sender, amount);
        }
        emit PayoutClaimed(roundId, msg.sender, amount);
    }

    function _createRound(uint256 propertyId, address paymentToken, uint256 amount, uint256 totalSharesSnapshot, string calldata reportURI) internal returns (uint256 roundId) {
        roundId = nextRoundId++;
        rounds[roundId] = PayoutRound(roundId, propertyId, paymentToken, amount, totalSharesSnapshot, reportURI, true);
        emit PayoutDeposited(roundId, propertyId, paymentToken, amount, totalSharesSnapshot, reportURI);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}
