// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev StuffERC721.
 */
contract StuffERC721 is ERC721, ERC721Enumerable, Ownable {
    using SafeERC20 for IERC20;

    /**
     * @dev Important.
     */
    uint256 public immutable STUFF_ID;

    /**
     * @dev Constants.
     */
    uint256 public constant CANVAS_WIDTH = 42;
    uint256 public constant CANVAS_HEIGHT = 42;
    uint256 public constant CANVAS_SIZE = CANVAS_WIDTH * CANVAS_HEIGHT;

    /**
     * @dev Struct StuffCollection.
     */
    struct StuffCollection {
        string sku;
        string category;
        string metadataURI;
        string[] palette;
        string[][] options;

        IERC20 paymentToken;
        address paymentRecipient;
        uint256 maxSupply;
        uint256 mintPriceToken;
    }

    /**
     * @dev Struct StuffMintParams.
     */
    struct StuffMintParams {
        string author;

        string title;
        string description;
        bytes canvas;
        string[][] options;
    }

    /**
     * @dev Struct Stuff.
     */
    struct Stuff {
        string author;
        address authorAddress;

        string title;
        string description;
        uint256 creationDate;
        bytes canvas;
        string[][] options;
    }

    /**
     * @dev Privates.
     */
    string private SKU;
    string private CATEGORY;
    string private METADATA_URI;
    string[] private PALETTE;
    string[][] private OPTIONS;

    /**
     * @dev Immutables.
     */
    IERC20 immutable PAYMENT_TOKEN;
    address immutable PAYMENT_RECIPIENT;
    uint256 immutable MAX_SUPPLY;
    uint256 immutable MINT_PRICE_TOKEN;

    /**
     * @dev Variables.
     */
    uint256 public tokenIdsIndex = 0;

    /**
     * @dev Mappings.
     */
    mapping(uint256 => Stuff) private _stuffs;

    /**
     * @dev Events.
     */
    event StuffCreated(uint256 indexed tokenId, address indexed authorAddress, bytes32 canvasHash);
    event MetadataURIUpdated(string metadataURI);

    /**
     * @dev Errors.
     */
    error InvalidConfig();
    error InvalidPaletteLength(uint256 length);
    error MaxSupplyReached();
    error InvalidCanvasLength(uint256 length);
    error PaletteIndexOutOfRange(uint8 colorIndex);
    error InvalidOptionsLength(uint256 length);
    error InvalidOptionLength(uint256 optionIndex, uint256 length);
    error InvalidOptionName(uint256 optionIndex, string name);
    error InvalidOptionValue(uint256 optionIndex, string value);

    /**
     * @dev Constructor.
     */
    constructor(uint256 _stuffId, StuffCollection memory _stuffCollection, address _owner)
        ERC721(
            string(abi.encodePacked("stuff#", Strings.toString(_stuffId))),
            string(abi.encodePacked("STUFF#", Strings.toString(_stuffId)))
        )
        Ownable(_owner)
    {
        if (
            bytes(_stuffCollection.category).length == 0 || bytes(_stuffCollection.sku).length == 0
                || bytes(_stuffCollection.metadataURI).length == 0
                || address(_stuffCollection.paymentToken) == address(0)
                || _stuffCollection.paymentRecipient == address(0) || _stuffCollection.maxSupply <= 0
                || _stuffCollection.mintPriceToken <= 0
        ) {
            revert InvalidConfig();
        }

        if (_stuffCollection.palette.length == 0 || _stuffCollection.palette.length > uint256(type(uint8).max) + 1) {
            revert InvalidPaletteLength(_stuffCollection.palette.length);
        }

        STUFF_ID = _stuffId;

        SKU = _stuffCollection.sku;
        CATEGORY = _stuffCollection.category;
        METADATA_URI = _stuffCollection.metadataURI;
        PALETTE = _stuffCollection.palette;
        OPTIONS = _stuffCollection.options;

        PAYMENT_TOKEN = _stuffCollection.paymentToken;
        PAYMENT_RECIPIENT = _stuffCollection.paymentRecipient;
        MAX_SUPPLY = _stuffCollection.maxSupply;
        MINT_PRICE_TOKEN = _stuffCollection.mintPriceToken;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev mint.
     */
    function mint(address _to, StuffMintParams calldata _params) external returns (uint256 tokenId) {
        if (tokenIdsIndex >= MAX_SUPPLY) revert MaxSupplyReached();

        tokenId = tokenIdsIndex++;

        Stuff storage stuff = _stuffs[tokenId];

        stuff.author = _params.author;
        stuff.authorAddress = msg.sender;

        stuff.title = _params.title;
        stuff.description = _params.description;
        stuff.creationDate = block.timestamp;

        stuff.canvas = _validateCanvas(_params.canvas);
        stuff.options = _validateOptions(_params.options);

        PAYMENT_TOKEN.safeTransferFrom(msg.sender, PAYMENT_RECIPIENT, MINT_PRICE_TOKEN);

        _safeMint(_to, tokenId);

        emit StuffCreated(tokenId, stuff.authorAddress, keccak256(stuff.canvas));
    }

    /**
     * @dev getCollection.
     */
    function getCollection() public view returns (StuffCollection memory collection) {
        collection = StuffCollection({
            sku: SKU,
            metadataURI: METADATA_URI,
            palette: PALETTE,
            options: OPTIONS,
            category: CATEGORY,
            paymentToken: PAYMENT_TOKEN,
            paymentRecipient: PAYMENT_RECIPIENT,
            maxSupply: MAX_SUPPLY,
            mintPriceToken: MINT_PRICE_TOKEN
        });
    }

    /**
     * @dev getStuff.
     */
    function getStuff(uint256 _tokenId) external view returns (Stuff memory stuff) {
        _requireOwned(_tokenId);

        stuff = _stuffs[_tokenId];
    }

    /**
     * @dev updateMetadataURI.
     */
    function updateMetadataURI(string calldata metadataURI_) external onlyOwner {
        METADATA_URI = metadataURI_;

        emit MetadataURIUpdated(metadataURI_);
    }

    /**
     * @dev _validateCanvas.
     */
    function _validateCanvas(bytes calldata _canvas) internal view returns (bytes memory canvas) {
        if (_canvas.length != CANVAS_SIZE) revert InvalidCanvasLength(_canvas.length);

        for (uint256 i = 0; i < CANVAS_SIZE; i++) {
            uint8 colorIndex = uint8(_canvas[i]);
            if (colorIndex >= PALETTE.length) revert PaletteIndexOutOfRange(colorIndex);
        }

        canvas = _canvas;
    }

    /**
     * @dev _validateOptions.
     */
    function _validateOptions(string[][] calldata _options) internal view returns (string[][] memory options) {
        if (_options.length != OPTIONS.length) revert InvalidOptionsLength(_options.length);

        for (uint256 i = 0; i < OPTIONS.length; i++) {
            if (_options[i].length != 2) revert InvalidOptionLength(i, _options[i].length);

            string[] storage configuredOption = OPTIONS[i];

            if (keccak256(bytes(_options[i][0])) != keccak256(bytes(configuredOption[0]))) {
                revert InvalidOptionName(i, _options[i][0]);
            }

            bool isValidValue = false;

            for (uint256 j = 1; j < configuredOption.length; j++) {
                if (keccak256(bytes(_options[i][1])) == keccak256(bytes(configuredOption[j]))) {
                    isValidValue = true;
                    break;
                }
            }

            if (!isValidValue) revert InvalidOptionValue(i, _options[i][1]);
        }

        options = _options;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev
     */
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
}
