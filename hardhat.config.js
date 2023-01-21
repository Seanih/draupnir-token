require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-etherscan');
// provides access to .env variables in the config files
require('dotenv').config({ path: __dirname + '/.env.local' });

const ALCHEMY_GOERLI_NODE = process.env.ALCHEMY_GOERLI_NODE;
const ALCHEMY_MUMBAI_NODE = process.env.ALCHEMY_MUMBAI_NODE;
const METAMASK_PK = process.env.METAMASK_PK;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.17',
	networks: {
		goerli: {
			url: ALCHEMY_GOERLI_NODE,
			accounts: [METAMASK_PK],
		},
		mumbai: {
			url: ALCHEMY_MUMBAI_NODE,
			accounts: [METAMASK_PK],
		},
	},
};
