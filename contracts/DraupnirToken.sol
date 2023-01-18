// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DraupnirToken is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    string public baseTokenURI;
    uint256 public MAX_SUPPLY;
    uint256 public MAX_PER_WALLET;
    uint256 public MINT_PRICE;
    mapping(address => uint256) public nftsInWallet;
    uint256 public totalMintedNFTs = 0;

    constructor(
        uint256 _maxSupply,
        uint256 _walletMax,
        uint256 _mintPrice
    ) ERC721("DraupnirToken", "DPT") {
        baseTokenURI = "ipfs://QmbQKHDSqjMK6C6Y2EABgHTUuPS7zo8tU5gfmXdiXwAb58";
        MAX_SUPPLY = _maxSupply;
        MAX_PER_WALLET = _walletMax;
        MINT_PRICE = _mintPrice;
    }

    function safeMint(uint256 _quantity) public payable {
        require(_quantity > 0, "You have to mint at least 1");

        require(
            _quantity + nftsInWallet[msg.sender] < MAX_PER_WALLET,
            "You've already minted the max amount of NFTs"
        );

        // Shows user what the correct value should be
        uint256 totalPrice = _quantity * MINT_PRICE;
        require(
            msg.value == _quantity * MINT_PRICE,
            string(
                abi.encodePacked(
                    "Invalid value entered. It should be: ",
                    Strings.toString(totalPrice)
                )
            )
        );

        for (uint256 n = 0; n <= _quantity; n++) {
            _tokenIdCounter.increment();
            totalMintedNFTs++;
            nftsInWallet[msg.sender] += 1;
            uint256 tokenId = _tokenIdCounter.current();

            _safeMint(msg.sender, tokenId);
        }
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(_exists(_tokenId), "No token linked to that ID");

        return
            // concats tokenUri, tokenId & .json file-type into a string that is used by nft marketplaces to retrieve NFT images
            string(
                abi.encodePacked(
                    baseTokenURI,
                    Strings.toString(_tokenId),
                    ".json"
                )
            );
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
