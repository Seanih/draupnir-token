const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DraupnirToken Tests', function () {
	const deployTokenFixture = async () => {
		let [owner, user1, user2] = await ethers.getSigners();

		let contract = await ethers.getContractFactory('DraupnirToken');
		let DraupnirContract = await contract.deploy(300, 3);
		await DraupnirContract.deployed();

		return { owner, user1, user2, DraupnirContract };
	};

	const ethToWei = num => ethers.utils.parseEther(num.toString());

	describe('Contract Deployment', () => {
		describe('Success', () => {
			it('deploys contract to blockchain', async () => {
				const { DraupnirContract } = await loadFixture(deployTokenFixture);

				expect(DraupnirContract.address).to.equal(
					'0x5FbDB2315678afecb367f032d93F642f64180aa3'
				);
			});

			it('makes contract deployer the owner', async () => {
				let { owner, DraupnirContract } = await loadFixture(deployTokenFixture);

				expect(await DraupnirContract.owner()).to.equal(owner.address);
			});

			it('sets MAX_SUPPLY', async () => {
				const { DraupnirContract } = await loadFixture(deployTokenFixture);

				expect(await DraupnirContract.MAX_SUPPLY()).to.equal(300);
			});

			it('sets MAX_PER_WALLET', async () => {
				const { DraupnirContract } = await loadFixture(deployTokenFixture);

				expect(await DraupnirContract.MAX_PER_WALLET()).to.equal(3);
			});
		});
	});

	describe('Minting NFTs', () => {
		describe('Success', () => {
			it('mints NFTs up to MAX_PER_WALLET amount', async () => {
				const { DraupnirContract, user1 } = await loadFixture(
					deployTokenFixture
				);

				let tx = await DraupnirContract.connect(user1).safeMint(2, {
					value: ethToWei(0.02),
				});
				await tx.wait();

				expect(await DraupnirContract.nftsInWallet(user1.address)).to.equal(2);
			});
		});
	});
});
