# EstateFi — Blockchain-Powered Smart Real Estate Platform

EstateFi is a refined Web3 real estate investment website built from the supplied MVP and upgraded with the features requested across the three attached documents. The new version modernizes the layout and adds product sections for fractional investment, NFT property ownership, wallet flow, rental payouts, secondary marketplace liquidity, compliance, admin operations, event indexing, AI recommendations, and a production roadmap.



### New frontend pages

| Route | Purpose |
|---|---|
| `/` | New homepage explaining RealFraction, investment flow, featured opportunities and roadmap |
| `/properties` | Tokenized property marketplace with filters and polished cards |
| `/properties/:id` | Detailed investment page with simulator, wallet call-to-action, documents, risk, token model and transaction states |
| `/dashboard` | Investor portfolio dashboard with owned tokens, payouts, documents and resale action |
| `/marketplace` | Secondary marketplace for token resale liquidity |
| `/admin` | Operator/admin control layer for property approval, documents, rent recording, payout and monitoring |
| `/roadmap` | Technical advancement roadmap from the uploaded documents |
| `/property-3d` | Branded immersive 3D viewer experience |

### Product features represented in the website

- Automated legal and transaction documentation.
- NFT-based property ownership and smart-home access keys.
- Fractional ownership tokens with low minimum investment.
- Buy, rent, auction and secondary marketplace flows.
- Native token, staking and rewards-ready product direction.
- Rental income distribution and payout history.
- Investor dashboard.
- KYC/AML, risk disclosure, legal document and audit readiness sections.
- Event indexing and transaction-state lifecycle.
- AI property recommendation concept.
- Admin dashboard for property onboarding, approval, payout and monitoring.
- Hybrid on-chain/off-chain architecture explanation through UI and roadmap.
- Multi-chain and stablecoin readiness in roadmap.

## Technology stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- React Icons
- React Three Fiber / Drei / Three.js
- Jotai / Leva for 3D page state and controls

### Backend included in repository

- Express.js
- MongoDB / Mongoose structure
- Cloudinary config
- Existing API route structure
- Added `/health` endpoint
- Added `.env` example for RealFraction settings
- Database connection now activates only when `MONGO_URI` or `DB_URI` is set

### Web3 direction

The UI now clearly supports a production architecture where:

- Wallets connect through MetaMask, WalletConnect or Coinbase Wallet.
- Signature-based login can use SIWE.
- Property ownership can be represented by ERC-721 or ERC-1155 NFTs/tokens.
- Fractional ownership can use ERC-20, ERC-1155 or security-token style standards depending on jurisdiction.
- Marketplace and rental distribution contracts emit events.
- A backend indexer stores events for fast dashboard queries.
- Documents can be stored in S3/IPFS with hashes anchored on-chain.

## Recommended smart contract architecture

```text
PropertyFactory
  └── deploys / registers property token contracts

PropertyToken
  ├── ERC-1155 property share token model
  ├── balance-based ownership
  └── metadata hash for property documents

Marketplace
  ├── list tokens
  ├── buy tokens
  ├── cancel listing
  └── marketplace fee logic

RentalDistribution
  ├── receive monthly rent pool
  ├── compute holder share
  ├── claim rental income
  └── emit payout events

Escrow
  ├── hold investment funds
  ├── prevent overfunding
  ├── refund if target not met
  └── release after approval
```

Recommended contract improvements:

- Solidity `0.8.x`
- OpenZeppelin contracts
- `ReentrancyGuard`
- `Ownable` / `AccessControl`
- `Pausable`
- Events for every state transition
- Hardhat or Foundry tests
- Deployment scripts
- Testnet deployment and explorer verification

## Backend API roadmap

Suggested API endpoints for the next implementation phase:

```text
GET    /api/properties
GET    /api/properties/:id
POST   /api/investments
GET    /api/users/:wallet/portfolio
GET    /api/users/:wallet/transactions
GET    /api/properties/:id/financials
GET    /api/properties/:id/documents
POST   /api/marketplace/list
POST   /api/marketplace/buy
POST   /api/marketplace/cancel
GET    /api/payouts
POST   /api/admin/properties
POST   /api/admin/properties/:id/approve
POST   /api/admin/properties/:id/rent
POST   /api/admin/properties/:id/pause
```

Recommended backend upgrades:

- Request validation
- Rate limiting
- Centralized error handling
- API versioning
- Swagger/OpenAPI documentation
- Structured logs
- Audit event table
- Event indexer worker
- WebSocket or Server-Sent Events for transaction status

## Event indexing architecture

```text
Blockchain Events
  -> Event Indexer / The Graph / Subsquid / Custom Node.js Listener
  -> Postgres or MongoDB event store
  -> Backend API
  -> Investor Dashboard / Marketplace / Admin Panel
```

Important events:

- `PropertyCreated`
- `TokensPurchased`
- `TokensListed`
- `TokensSold`
- `RentalIncomeDeposited`
- `RentalIncomeClaimed`
- `PropertyExited`
- `DocumentHashUpdated`
- `PropertyPaused`

## Investor flow

```text
Connect Wallet
  -> Validate Chain
  -> Complete KYC / Risk Disclosure
  -> Select Property Tokens
  -> Review Investment Summary
  -> Sign Transaction
  -> Wait for Confirmation
  -> Event Indexed
  -> Tokens Visible in Portfolio
  -> Rental Payouts / Secondary Resale
```

## Admin flow

```text
Add Property
  -> Upload Documents
  -> Verify Ownership
  -> Add Financials
  -> Tokenize Property
  -> Approve Listing
  -> Open Funding / Auction
  -> Record Rental Income
  -> Trigger Payouts
  -> Monitor Events and Audit Logs
```

## Local run instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Start frontend

```bash
npm run dev
```

Open the Vite URL printed in the terminal, usually:

```text
http://localhost:5173
```

### 3. Optional backend setup

Copy the example environment file:

```bash
cp server/config/config.env.example server/config/config.env
```

Set at least:

```env
MONGO_URI=mongodb://127.0.0.1:27017/realfraction
JWT_SECRET=replace-with-a-long-random-secret
```

Start backend:

```bash
npm run server
```

Health check:

```bash
curl http://localhost:4006/health
```

### 4. Run frontend and backend together

```bash
npm run dev:full
```

### 5. Build frontend

```bash
npm run build
```

## Files added or heavily modified

```text
src/data/platform.js
src/hooks/useWallet.js
src/components/ui.jsx
src/components/layout/Navbar.jsx
src/components/layout/Footer.jsx
src/pages/Home.jsx
src/pages/Properties.jsx
src/pages/PropertyDetail.jsx
src/pages/Dashboard.jsx
src/pages/Marketplace.jsx
src/pages/Admin.jsx
src/pages/Roadmap.jsx
src/pages/Property3D.jsx
src/App.jsx
src/index.css
server/app.js
server/server.js
server/config/config.env.example
README.md
```

## Important production notes

This ZIP is a strong UI and architecture upgrade, but it is still a frontend/demo implementation. Before using it for real investments, add:

- Real wallet provider integration.
- Real smart contracts.
- Contract tests and audits.
- KYC/AML provider integration.
- Jurisdiction-specific legal review.
- Real backend persistence.
- Real event indexer.
- Real document storage and on-chain hash anchoring.
- Security hardening and observability.

## Suggested next engineering tasks

1. Implement MetaMask and WalletConnect with real provider state.
2. Add SIWE login and JWT session handling.
3. Build Solidity `PropertyFactory`, `PropertyToken`, `Marketplace`, `RentalDistribution` and `Escrow` contracts.
4. Add Hardhat or Foundry test suite.
5. Replace static `src/data/platform.js` with API responses.
6. Add MongoDB/Postgres schemas for properties, investments, documents, payouts and marketplace listings.
7. Add event indexer and transaction status WebSocket.
8. Add KYC and risk disclosure screens.
9. Add Playwright end-to-end tests for wallet/investment flows.
10. Add production deployment pipeline with GitHub Actions.

## Working wallet investment signing flow

The property detail page now includes a functional EVM wallet flow:

```text
Open Property Detail
  -> Click Connect Wallet & Sign Investment
  -> MetaMask / injected wallet opens
  -> App validates the configured chain
  -> App requests network switch if needed
  -> User signs a RealFraction investment-intent message
  -> Signed receipt is stored in localStorage
  -> UI shows confirmed status and lets the user copy the receipt
```

Default demo mode uses message signing, so no real funds are moved. This makes the button workable without a deployed smart contract.

Optional production contract mode:

```env
VITE_REQUIRED_CHAIN_ID=80002
VITE_INVESTMENT_CONTRACT_ADDRESS=0xYourInvestmentContract
```

When `VITE_INVESTMENT_CONTRACT_ADDRESS` is configured with a valid address, the frontend calls:

```solidity
invest(uint256 propertyId, uint256 tokenQuantity)
```

For a real production investment transaction, connect this to your audited `Escrow` / `PropertyToken` contract and update the ABI in `src/hooks/useWallet.js`.

Troubleshooting:

- If you see “wallet not found”, open the app in MetaMask browser or install MetaMask.
- If the wrong-network prompt fails, manually add/switch to the configured chain.
- If the user rejects the signature, the UI shows `User rejected signature`.
- If no contract address is configured, the app intentionally uses signed investment-intent demo mode.

---

## Integrated Smart Contracts

This ZIP now includes a full Hardhat smart-contract workspace in:

```bash
smart-contracts/
```

### Contracts included

| Contract | Purpose |
|---|---|
| `PropertyNFT.sol` | ERC-721 NFT representing the unique legal/ownership record for a property. |
| `PropertyShareToken.sol` | ERC-1155 fractional ownership shares per property. |
| `PropertyFactory.sol` | Creates property records, mints ownership NFT, and manages share minting. |
| `InvestmentEscrow.sol` | Primary investment contract. Supports native-token investment and ERC20/USDC investment. |
| `SecondaryMarketplace.sol` | Lets investors list, buy, and cancel fractional property-share listings. |
| `RentalDistribution.sol` | Deposits rental income and allows token holders to claim proportional payout. |
| `DocumentRegistry.sol` | Registers legal/title/valuation/audit document hashes and URIs. |
| `PlatformToken.sol` | Optional utility/reward/governance token for the ecosystem. |
| `MockUSDC.sol` | Local/testnet stablecoin mock for development. |

### Frontend integration added

The investment page now imports contract config from:

```bash
src/contracts/contractConfig.js
```

The wallet hook was updated in:

```bash
src/hooks/useWallet.js
```

When `VITE_INVESTMENT_ESCROW_ADDRESS` is configured, the **Sign Investment Transaction** button performs:

```text
Connect wallet
→ sign investment intent message
→ if VITE_PAYMENT_TOKEN_ADDRESS is empty: call InvestmentEscrow.investNative(propertyId, shares)
→ if VITE_PAYMENT_TOKEN_ADDRESS is set: approve ERC20 + call InvestmentEscrow.investWithToken(propertyId, shares)
→ show transaction hash and receipt
```

When no contract address is configured, the same button still works in demo mode by creating a signed investment intent receipt.

### Install and run frontend

```bash
npm install
npm run dev
```

### Install and run contracts

```bash
npm run contracts:install
npm run contracts:compile
npm run contracts:test
```

### Start local Hardhat chain

Open terminal 1:

```bash
npm run contracts:node
```

Open terminal 2:

```bash
npm run contracts:deploy
```

After deploy, copy the printed addresses into `.env`:

```env
VITE_REQUIRED_CHAIN_ID=31337
VITE_PROPERTY_FACTORY_ADDRESS=0x...
VITE_INVESTMENT_ESCROW_ADDRESS=0x...
VITE_PROPERTY_SHARE_TOKEN_ADDRESS=0x...
VITE_SECONDARY_MARKETPLACE_ADDRESS=0x...
VITE_RENTAL_DISTRIBUTION_ADDRESS=0x...
VITE_DOCUMENT_REGISTRY_ADDRESS=0x...
VITE_PLATFORM_TOKEN_ADDRESS=0x...
VITE_PAYMENT_TOKEN_ADDRESS=0x... # MockUSDC address for ERC20 flow, or empty for native flow
VITE_NATIVE_WEI_PER_SHARE=0
```

Then restart frontend:

```bash
npm run dev
```

### MetaMask local chain setup

Add local Hardhat network:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Import one of the Hardhat test accounts printed by `npm run contracts:node` into MetaMask.

### Important notes

- The frontend can run without deployed contracts using demo signed receipts.
- Real on-chain investment requires deployed contracts and correct `.env` addresses.
- ERC20/USDC investment requires the investor to hold the payment token and approve escrow.
- Native investment uses `VITE_NATIVE_WEI_PER_SHARE` to calculate `msg.value`.
- Contract compilation may require internet on first run because Hardhat downloads the Solidity compiler.
