// Frontend contract configuration for the integrated Web3 real-estate contracts.
// Deploy contracts from /smart-contracts, then copy deployed addresses into .env.

export const CONTRACT_ADDRESSES = {
  propertyFactory: import.meta.env.VITE_PROPERTY_FACTORY_ADDRESS || '',
  investmentEscrow: import.meta.env.VITE_INVESTMENT_ESCROW_ADDRESS || import.meta.env.VITE_INVESTMENT_CONTRACT_ADDRESS || '',
  propertyShareToken: import.meta.env.VITE_PROPERTY_SHARE_TOKEN_ADDRESS || '',
  secondaryMarketplace: import.meta.env.VITE_SECONDARY_MARKETPLACE_ADDRESS || '',
  rentalDistribution: import.meta.env.VITE_RENTAL_DISTRIBUTION_ADDRESS || '',
  documentRegistry: import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS || '',
  platformToken: import.meta.env.VITE_PLATFORM_TOKEN_ADDRESS || '',
  paymentToken: import.meta.env.VITE_PAYMENT_TOKEN_ADDRESS || '',
};

export const PROPERTY_FACTORY_ABI = [
  'event PropertyCreated(uint256 indexed propertyId,string name,address indexed sponsor,uint256 totalShares,uint256 sharePrice,uint256 nftId,bytes32 documentHash,string metadataURI)',
  'function createProperty(string calldata name,string calldata metadataURI,uint256 totalShares,uint256 sharePrice,bytes32 documentHash,address sponsor) external returns (uint256 propertyId)',
  'function mintShares(address to,uint256 propertyId,uint256 amount) external',
  'function reserveMintedShares(uint256 propertyId,uint256 amount) external',
  'function setStatus(uint256 propertyId,uint8 status) external',
  'function updateDocumentHash(uint256 propertyId,bytes32 documentHash) external'
];

export const INVESTMENT_ESCROW_ABI = [
  'event InvestmentCompleted(uint256 indexed propertyId,address indexed investor,uint256 shares,uint256 grossAmount,uint256 platformFee,address paymentToken)',
  'function investNative(uint256 propertyId,uint256 shares) external payable',
  'function investWithToken(uint256 propertyId,uint256 shares) external'
];

export const PROPERTY_SHARE_TOKEN_ABI = [
  'function balanceOf(address account,uint256 id) external view returns (uint256)',
  'function balanceOfBatch(address[] calldata accounts,uint256[] calldata ids) external view returns (uint256[] memory)',
  'function setApprovalForAll(address operator,bool approved) external',
  'function isApprovedForAll(address account,address operator) external view returns (bool)',
  'function uri(uint256 propertyId) external view returns (string memory)'
];

export const SECONDARY_MARKETPLACE_ABI = [
  'event Listed(uint256 indexed listingId,address indexed seller,uint256 indexed propertyId,uint256 shares,uint256 pricePerShare,address paymentToken)',
  'event Purchased(uint256 indexed listingId,address indexed buyer,address indexed seller,uint256 shares,uint256 grossAmount,uint256 fee)',
  'event Cancelled(uint256 indexed listingId)',
  'function list(uint256 propertyId,uint256 shares,uint256 pricePerShare,address paymentToken) external returns (uint256 listingId)',
  'function buy(uint256 listingId,uint256 shares) external payable',
  'function cancel(uint256 listingId) external'
];

export const RENTAL_DISTRIBUTION_ABI = [
  'event PayoutDeposited(uint256 indexed roundId,uint256 indexed propertyId,address paymentToken,uint256 amount,uint256 totalSharesSnapshot,string reportURI)',
  'event PayoutClaimed(uint256 indexed roundId,address indexed investor,uint256 amount)',
  'function claim(uint256 roundId) external',
  'function depositNativePayout(uint256 propertyId,uint256 totalSharesSnapshot,string calldata reportURI) external payable'
];

export const DOCUMENT_REGISTRY_ABI = [
  'event DocumentRegistered(uint256 indexed documentId,uint256 indexed propertyId,bytes32 documentHash,string documentType,string uri,address indexed uploadedBy)',
  'function registerDocument(uint256 propertyId,bytes32 documentHash,string calldata documentType,string calldata uri) external',
  'function getPropertyDocuments(uint256 propertyId) external view returns (uint256[] memory)'
];

export const ERC20_ABI = [
  'function approve(address spender,uint256 amount) external returns (bool)',
  'function allowance(address owner,address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)'
];

export function hasAddress(address) {
  return Boolean(address && /^0x[a-fA-F0-9]{40}$/.test(address));
}
