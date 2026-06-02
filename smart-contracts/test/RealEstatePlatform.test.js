const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Real-estate smart-contract platform", function () {
  async function fixture() {
    const [admin, investor, buyer, treasury] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();

    const ShareToken = await ethers.getContractFactory("PropertyShareToken");
    const shareToken = await ShareToken.deploy("ipfs://property-shares/{id}.json", admin.address);

    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const nft = await PropertyNFT.deploy(admin.address);

    const Factory = await ethers.getContractFactory("PropertyFactory");
    const factory = await Factory.deploy(admin.address, await shareToken.getAddress(), await nft.getAddress());

    await shareToken.grantRole(await shareToken.MINTER_ROLE(), await factory.getAddress());
    await nft.grantRole(await nft.MINTER_ROLE(), await factory.getAddress());

    const Escrow = await ethers.getContractFactory("InvestmentEscrow");
    const escrow = await Escrow.deploy(admin.address, await factory.getAddress(), await usdc.getAddress(), treasury.address, 150);
    await factory.grantRole(await factory.PROPERTY_MANAGER_ROLE(), await escrow.getAddress());

    const Marketplace = await ethers.getContractFactory("SecondaryMarketplace");
    const marketplace = await Marketplace.deploy(admin.address, await shareToken.getAddress(), treasury.address, 150);

    const Rental = await ethers.getContractFactory("RentalDistribution");
    const rental = await Rental.deploy(admin.address, await shareToken.getAddress());

    await usdc.transfer(investor.address, ethers.parseEther("10000"));
    await usdc.transfer(buyer.address, ethers.parseEther("10000"));

    return { admin, investor, buyer, treasury, usdc, shareToken, nft, factory, escrow, marketplace, rental };
  }

  it("creates a property and lets investor buy shares", async function () {
    const { admin, investor, usdc, shareToken, factory, escrow } = await fixture();
    await factory.createProperty("Modern Villa", "Austin, TX", 1000, ethers.parseEther("10"), admin.address, ethers.id("docs"), "ipfs://villa.json");
    await usdc.connect(investor).approve(await escrow.getAddress(), ethers.parseEther("100"));
    await expect(escrow.connect(investor).investWithToken(1, 10)).to.emit(escrow, "InvestmentCompleted");
    expect(await shareToken.balanceOf(investor.address, 1)).to.equal(10);
  });

  it("supports secondary market listing and purchase", async function () {
    const { admin, investor, buyer, usdc, shareToken, factory, escrow, marketplace } = await fixture();
    await factory.createProperty("Modern Villa", "Austin, TX", 1000, ethers.parseEther("10"), admin.address, ethers.id("docs"), "ipfs://villa.json");
    await usdc.connect(investor).approve(await escrow.getAddress(), ethers.parseEther("100"));
    await escrow.connect(investor).investWithToken(1, 10);
    await shareToken.connect(investor).setApprovalForAll(await marketplace.getAddress(), true);
    await marketplace.connect(investor).list(1, 5, ethers.parseEther("11"), await usdc.getAddress());
    await usdc.connect(buyer).approve(await marketplace.getAddress(), ethers.parseEther("55"));
    await expect(marketplace.connect(buyer).buy(1, 5)).to.emit(marketplace, "Purchased");
    expect(await shareToken.balanceOf(buyer.address, 1)).to.equal(5);
  });

  it("distributes rental income proportionally", async function () {
    const { admin, investor, usdc, shareToken, factory, escrow, rental } = await fixture();
    await factory.createProperty("Modern Villa", "Austin, TX", 1000, ethers.parseEther("10"), admin.address, ethers.id("docs"), "ipfs://villa.json");
    await usdc.connect(investor).approve(await escrow.getAddress(), ethers.parseEther("100"));
    await escrow.connect(investor).investWithToken(1, 10);
    await usdc.approve(await rental.getAddress(), ethers.parseEther("1000"));
    await rental.depositTokenPayout(1, await usdc.getAddress(), ethers.parseEther("1000"), 1000, "ipfs://monthly-report.json");
    await expect(rental.connect(investor).claim(1)).to.emit(rental, "PayoutClaimed");
  });
});
