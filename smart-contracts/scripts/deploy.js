const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();

  const PlatformToken = await hre.ethers.getContractFactory("PlatformToken");
  const platformToken = await PlatformToken.deploy(deployer.address, hre.ethers.parseEther("100000000"));
  await platformToken.waitForDeployment();

  const ShareToken = await hre.ethers.getContractFactory("PropertyShareToken");
  const shareToken = await ShareToken.deploy("ipfs://property-shares/{id}.json", deployer.address);
  await shareToken.waitForDeployment();

  const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
  const propertyNFT = await PropertyNFT.deploy(deployer.address);
  await propertyNFT.waitForDeployment();

  const Factory = await hre.ethers.getContractFactory("PropertyFactory");
  const factory = await Factory.deploy(deployer.address, await shareToken.getAddress(), await propertyNFT.getAddress());
  await factory.waitForDeployment();

  await (await shareToken.grantRole(await shareToken.MINTER_ROLE(), await factory.getAddress())).wait();
  await (await propertyNFT.grantRole(await propertyNFT.MINTER_ROLE(), await factory.getAddress())).wait();

  const Escrow = await hre.ethers.getContractFactory("InvestmentEscrow");
  const escrow = await Escrow.deploy(deployer.address, await factory.getAddress(), await mockUSDC.getAddress(), deployer.address, 150);
  await escrow.waitForDeployment();
  await (await factory.grantRole(await factory.PROPERTY_MANAGER_ROLE(), await escrow.getAddress())).wait();

  const Marketplace = await hre.ethers.getContractFactory("SecondaryMarketplace");
  const marketplace = await Marketplace.deploy(deployer.address, await shareToken.getAddress(), deployer.address, 150);
  await marketplace.waitForDeployment();

  const RentalDistribution = await hre.ethers.getContractFactory("RentalDistribution");
  const rentalDistribution = await RentalDistribution.deploy(deployer.address, await shareToken.getAddress());
  await rentalDistribution.waitForDeployment();

  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistry.deploy(deployer.address);
  await documentRegistry.waitForDeployment();

  const deployments = {
    MockUSDC: await mockUSDC.getAddress(),
    PlatformToken: await platformToken.getAddress(),
    PropertyShareToken: await shareToken.getAddress(),
    PropertyNFT: await propertyNFT.getAddress(),
    PropertyFactory: await factory.getAddress(),
    InvestmentEscrow: await escrow.getAddress(),
    SecondaryMarketplace: await marketplace.getAddress(),
    RentalDistribution: await rentalDistribution.getAddress(),
    DocumentRegistry: await documentRegistry.getAddress()
  };

  console.log("Deployments:", deployments);

  const env = [
    `VITE_PROPERTY_FACTORY_ADDRESS=${deployments.PropertyFactory}`,
    `VITE_INVESTMENT_ESCROW_ADDRESS=${deployments.InvestmentEscrow}`,
    `VITE_PROPERTY_SHARE_TOKEN_ADDRESS=${deployments.PropertyShareToken}`,
    `VITE_SECONDARY_MARKETPLACE_ADDRESS=${deployments.SecondaryMarketplace}`,
    `VITE_RENTAL_DISTRIBUTION_ADDRESS=${deployments.RentalDistribution}`,
    `VITE_DOCUMENT_REGISTRY_ADDRESS=${deployments.DocumentRegistry}`,
    `VITE_PLATFORM_TOKEN_ADDRESS=${deployments.PlatformToken}`,
    `VITE_PAYMENT_TOKEN_ADDRESS=${deployments.MockUSDC}`,
    `VITE_PAYMENT_TOKEN_DECIMALS=6`,
    `VITE_NATIVE_WEI_PER_SHARE=0`,
    ``
  ].join("\n");
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "frontend.env"), env);
  fs.writeFileSync(path.join(outDir, "addresses.json"), JSON.stringify(deployments, null, 2));
  console.log("\nFrontend env written to smart-contracts/deployments/frontend.env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
