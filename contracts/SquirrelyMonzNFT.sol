
//     ____   ___  _   _ ___ ____  ____  _____ _  __   ____  __  ___  _   _ _____    //
//    / ___| / _ \| | | |_ _|  _ \|  _ \| ____| | \ \ / /  \/  |/ _ \| \ | |__  /      //
//    \___ \| | | | | | || || |_) | |_) |  _| | |  \ V /| |\/| | | | |  \| | / /       //
//     ___) | |_| | |_| || ||  _ <|  _ <| |___| |___| | | |  | | |_| | |\  |/ /_       //
//    |____/ \__\_\\___/|___|_| \_\_| \_\_____|_____|_| |_|  |_|\___/|_| \_/____|      //
//      SQUIRRELS KNOW WEALTH! - @0xGGm.eth - http://SquirrelyMonz.xyz
//      Version 3.0 working


// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SquirrelyMonzNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint;
    using Counters for Counters.Counter;
    enum SaleStatus{ PAUSED, PRESALE, PUBLIC }

    Counters.Counter private _tokenIds;

    uint public constant COLLECTION_SIZE = 7500;
    uint public constant FIRSTXFREE = 0;
    uint public constant TOKENS_PER_TRAN_LIMIT = 100;
    uint public constant TOKENS_PER_PERSON_PUB_LIMIT = 20;
    
    
    uint public MINT_PRICE = 0.001 ether;
    SaleStatus public saleStatus = SaleStatus.PAUSED;
    
    string private _baseURL;
    string public preRevealURL = "ipfs://bafyreidzhi4aryqcsf6v3yg4mhnn2au7ywrw7jx6fmb4c3htex6lb767zm/metadata.json";

    mapping(address => uint) private _mintedCount;
    

    constructor() ERC721("SquirrelyMonz8.0", "SQZ"){}
    
    
       /// @notice Reveal metadata for all the tokens
    function reveal(string calldata url) external onlyOwner {
        _baseURL = url;
    }
    
      /// @notice Set Pre Reveal URL
    function setPreRevealUrl(string calldata url) external onlyOwner {
        preRevealURL = url;
    }

    /// @notice Set base metadata URL
    // function setBaseURL(string calldata url) external onlyOwner {
    //     _baseURL = url;
    // }

    function totalSupply() external view returns (uint) {
        return _tokenIds.current();
    }

    /// @dev override base uri. It will be combined with token ID
    function _baseURI() internal view override returns (string memory) {
        return _baseURL;
    }

    /// @notice Update current sale stage
    function setSaleStatus(SaleStatus status) external onlyOwner {
        saleStatus = status;
    }

    /// @notice Update public mint price
    function setPublicMintPrice(uint price) external onlyOwner {
        MINT_PRICE = price;
    }

    /// @notice Withdraw contract balance
    function withdraw() external onlyOwner nonReentrant {
        uint balance = address(this).balance;
        require(balance > 0, "No balance");
        
        // Effects: Update state before external call
        address owner = owner();
        
        // Interactions: External call
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /// @notice Allows owner to mint tokens to a specified address
    function airdrop(address to, uint count) external onlyOwner {
        require(_tokenIds.current() + count <= COLLECTION_SIZE, "Request exceeds collection size");
        _mintTokens(to, count);
    }

    /// @notice Get token URI. In case of delayed reveal we give user the json of the placeholer metadata.
    /// @param tokenId token ID
    function tokenURI(uint tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, "/", tokenId.toString(), ".json")) 
            : preRevealURL;
    }
    
    function calcTotal(uint count) public view returns(uint) {
        require(saleStatus != SaleStatus.PAUSED, "SquirrelyMonz: Sales are off");

        
        require(msg.sender != address(0));
        uint totalMintedCount = _mintedCount[msg.sender];

        if(FIRSTXFREE > totalMintedCount) {
            uint freeLeft = FIRSTXFREE - totalMintedCount;
            if(count > freeLeft) {
                // just pay the difference
                count -= freeLeft;
            }
            else {
                count = 0;
            }
        }

        
        uint price = MINT_PRICE;

        return count * price;
    }
    
    
    
    /// @notice Mints specified amount of tokens
    /// @param count How many tokens to mint
    function mint(uint count) external payable nonReentrant {
        require(saleStatus != SaleStatus.PAUSED, "SquirrelyMonz: Sales are off");
        require(_tokenIds.current() + count <= COLLECTION_SIZE, "SquirrelyMonz: Number of requested tokens will exceed collection size");
        require(count <= TOKENS_PER_TRAN_LIMIT, "SquirrelyMonz: Number of requested tokens exceeds allowance (20)");
        require(_mintedCount[msg.sender] + count <= TOKENS_PER_PERSON_PUB_LIMIT, "SquirrelyMonz: Number of requested tokens exceeds allowance (20)");
        require(msg.value >= calcTotal(count), "SquirrelyMonz: Ether value sent is not sufficient");
        _mintedCount[msg.sender] += count;
        _mintTokens(msg.sender, count);
    }
    /// @dev Perform actual minting of the tokens
    function _mintTokens(address to, uint count) internal {
        for(uint index = 0; index < count; index++) {

            _tokenIds.increment();
            uint newItemId = _tokenIds.current();

            _safeMint(to, newItemId);
        }
    }

    
}

                    
