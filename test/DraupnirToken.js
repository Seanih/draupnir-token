//* only testing adjustments & additions I made since base contracts come from OpenZeppelin

const {
	loadFixture,
	time,
} = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('DraupnirToken Tests', function () {
	const deployAndMintFixture = async () => {
		let [owner, user1, user2] = await ethers.getSigners();
		let contract = await ethers.getContractFactory('DraupnirToken');
		let DraupnirContract = await contract.deploy(300, 3);
		await DraupnirContract.deployed();

		let tx = await DraupnirContract.connect(user1).safeMint(2, {
			value: ethToWei(0.02),
		});
		await tx.wait();

		tx = await DraupnirContract.connect(user2).safeMint(3, {
			value: ethToWei(0.03),
		});
		await tx.wait();

		return { owner, user1, user2, DraupnirContract, tx };
	};

	const ethToWei = num => ethers.utils.parseEther(num.toString());

	describe('Contract Deployment', () => {
		describe('Success', () => {
			it('deploys contract to blockchain', async () => {
				const { DraupnirContract } = await loadFixture(deployAndMintFixture);

				expect(DraupnirContract.address).to.equal(
					'0x5FbDB2315678afecb367f032d93F642f64180aa3'
				);
			});

			it('makes contract deployer the owner', async () => {
				let { owner, DraupnirContract } = await loadFixture(
					deployAndMintFixture
				);

				expect(await DraupnirContract.owner()).to.equal(owner.address);
			});

			it('sets MAX_SUPPLY', async () => {
				const { DraupnirContract } = await loadFixture(deployAndMintFixture);

				expect(await DraupnirContract.MAX_SUPPLY()).to.equal(300);
			});

			it('sets MAX_PER_WALLET', async () => {
				const { DraupnirContract } = await loadFixture(deployAndMintFixture);

				expect(await DraupnirContract.MAX_PER_WALLET()).to.equal(3);
			});
		});
	});

	describe('Minting NFTs', () => {
		describe('Success', () => {
			it('mints NFTs and accurately updates wallet NFT balances', async () => {
				const { DraupnirContract, user1, user2 } = await loadFixture(
					deployAndMintFixture
				);

				expect(await DraupnirContract.nftsInWallet(user1.address)).to.equal(2);

				expect(await DraupnirContract.nftsInWallet(user2.address)).to.equal(3);
			});

			it('emits DraupnirMinted event', async () => {
				const { DraupnirContract, user1 } = await loadFixture(
					deployAndMintFixture
				);

				await expect(
					DraupnirContract.connect(user1).safeMint(1, { value: ethToWei(0.01) })
				)
					.to.emit(DraupnirContract, 'DraupnirMinted')
					.withArgs(user1.address, 1, (await time.latest()) + 1);
			});

			it('accurately updates totalMintedNFTs', async () => {
				const { DraupnirContract, user1 } = await loadFixture(
					deployAndMintFixture
				);

				expect(await DraupnirContract.totalMintedNFTs()).to.equal(5);
			});

			it('adds mint fees to contract', async () => {
				const { DraupnirContract } = await loadFixture(deployAndMintFixture);

				expect(await DraupnirContract.contractBalance()).to.equal(
					ethToWei(0.05)
				);
			});
		});

		describe('Failure', () => {
			it('rejects mint attempts (< 1) & (> MAX_PER_WALLET)', async () => {
				const { DraupnirContract, user1 } = await loadFixture(
					deployAndMintFixture
				);

				await expect(
					DraupnirContract.connect(user1).safeMint(2, { value: ethToWei(0.02) })
				).to.be.revertedWith('Cannot mint more than the max allowance');

				await expect(
					DraupnirContract.connect(user1).safeMint(0, {
						value: ethToWei(0),
					})
				).to.be.revertedWith('You have to mint at least 1');
			});
		});
	});

	describe('Contract Withdrawals', () => {
		describe('Success', () => {
			it('updates contract balance after owner withdrawals', async () => {
				const { DraupnirContract, owner } = await loadFixture(
					deployAndMintFixture
				);

				await expect(
					DraupnirContract.withdrawFromContract(ethToWei(0.04))
				).to.changeEtherBalances(
					[DraupnirContract.address, owner.address],
					[ethToWei(-0.04), ethToWei(0.04)]
				);
			});
		});

		describe('Failure', () => {
			it('rejects withdrawal attempts (< 0) & (> contractBalance)', async () => {
				const { DraupnirContract, owner } = await loadFixture(
					deployAndMintFixture
				);

				await expect(
					DraupnirContract.withdrawFromContract(ethToWei(0.1))
				).to.be.revertedWith('Insufficient funds');

				await expect(
					DraupnirContract.withdrawFromContract(ethToWei(0))
				).to.be.revertedWith("Can't withdraw '0'");
			});

			it('rejects withdrawals from non-owner wallets', async () => {
				const { DraupnirContract, user1 } = await loadFixture(
					deployAndMintFixture
				);

				await expect(
					DraupnirContract.connect(user1).withdrawFromContract(
						await DraupnirContract.contractBalance()
					)
				).to.be.reverted;
			});
		});
	});
});
