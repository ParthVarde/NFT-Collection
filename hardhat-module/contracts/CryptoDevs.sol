//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhiteList.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI;
    uint256 public _price = 0.0001 ether;
    bool public _paused;
    uint256 public maxTokenIds = 20;
    uint256 public tokenIds;
    IWhiteList whitelist;
    bool public preSaleStarted;
    uint256 public preSaleEnded;

    constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Dev", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhiteList(whitelistContract);
    }

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currentlly paused!");
        _;
    }

    function startPreSale() public onlyOwner {
        preSaleStarted = true;
        preSaleEnded = block.timestamp + 5 minutes;
    }

    function preSaleMint() public payable onlyWhenNotPaused {
        require(preSaleStarted && block.timestamp < preSaleEnded, "Presale is not running");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted!");
        require(tokenIds < maxTokenIds, "Exceeded maximum limit");
        require(msg.value >= _price, "Not enought ether");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(preSaleStarted && block.timestamp >= preSaleEnded, "Presale not ended yet");
        require(tokenIds < maxTokenIds, "Exceeded maximum limit");
        require(msg.value >= _price, "Not enough ether");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns(string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    } 

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool success, ) = _owner.call{ value: amount}("");
        require(success, "Failed to withdraw Ether"); 
    }
}