# Web3 Real Estate Smart Contracts

This folder contains the complete Hardhat contract layer integrated with the real-estate frontend.

## Architecture

```text
PropertyFactory
 ├─ mints PropertyNFT ownership certificate
 ├─ creates property record
 └─ mints/reserves PropertyShareToken fractional shares

InvestmentEscrow
 ├─ accepts native token investment through investNative()
 ├─ accepts stablecoin/ERC20 investment through investWithToken()
 └─ mints fractional shares to investor

SecondaryMarketplace
 ├─ locks ERC-1155 shares in marketplace
 ├─ supports partial/full purchase
 └─ transfers payment to seller minus fee

RentalDistribution
 ├─ admin deposits rent pool
 └─ token holders claim proportional income

DocumentRegistry
 └─ stores property document hash + URI metadata
```

## Commands

```bash
npm install
npm run compile
npm test
npm run node
npm run deploy
```

## Deploy locally

Terminal 1:

```bash
npm run node
```

Terminal 2:

```bash
npm run deploy
```

The deploy script writes:

```bash
deployments/frontend.env
deployments/addresses.json
```

Copy `frontend.env` values into the root app `.env` file and restart Vite.

## Frontend integration

Frontend files changed:

```bash
../src/contracts/contractConfig.js
../src/hooks/useWallet.js
../.env.example
```

The investment button now supports:

- wallet connect
- signed investment intent
- native investment via `InvestmentEscrow.investNative(propertyId, shares)`
- ERC20/USDC investment via approve + `InvestmentEscrow.investWithToken(propertyId, shares)`
- fallback demo signed receipt when contract addresses are not configured

## Production notes

Before production use, complete legal/security work:

- third-party smart contract audit
- KYC/AML restrictions
- security-token law review
- multisig admin roles
- pauser/governance controls
- oracle/valuation risk review
- real escrow/payment reconciliation
