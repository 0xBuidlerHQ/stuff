// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

interface IERC3009 {
    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

/**
 * @dev StuffERC721.
 */
contract StuffERC721 is ERC721, ERC721Enumerable {
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
     * @dev Struct MintAuthorization.
     */
    struct MintAuthorization {
        address from;
        uint256 validAfter;
        uint256 validBefore;
        bytes32 nonce;
        uint8 v;
        bytes32 r;
        bytes32 s;
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
    address public owner;
    address public relayer;
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
    event OwnerUpdated(address indexed owner);
    event RelayerUpdated(address indexed relayer);

    /**
     * @dev Errors.
     */
    error InvalidConfig();
    error InvalidOwner();
    error InvalidRelayer();
    error Unauthorized();
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
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert Unauthorized();
        _;
    }

    constructor(uint256 _stuffId, StuffCollection memory _stuffCollection, address _owner, address _relayer)
        ERC721(
            string(abi.encodePacked("stuff#", Strings.toString(_stuffId))),
            string(abi.encodePacked("STUFF#", Strings.toString(_stuffId)))
        )
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

        if (_owner == address(0)) revert InvalidOwner();
        if (_relayer == address(0)) revert InvalidRelayer();

        STUFF_ID = _stuffId;
        owner = _owner;
        relayer = _relayer;

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
        PAYMENT_TOKEN.safeTransferFrom(msg.sender, PAYMENT_RECIPIENT, MINT_PRICE_TOKEN);

        tokenId = _mintStuff(_to, msg.sender, _params);
    }

    /**
     * @dev mintWithAuthorization.
     */
    function mintWithAuthorization(
        address _to,
        StuffMintParams calldata _params,
        MintAuthorization calldata _authorization
    ) external onlyRelayer returns (uint256 tokenId) {
        IERC3009(address(PAYMENT_TOKEN))
            .receiveWithAuthorization(
                _authorization.from,
                address(this),
                MINT_PRICE_TOKEN,
                _authorization.validAfter,
                _authorization.validBefore,
                _authorization.nonce,
                _authorization.v,
                _authorization.r,
                _authorization.s
            );

        PAYMENT_TOKEN.safeTransfer(PAYMENT_RECIPIENT, MINT_PRICE_TOKEN);

        tokenId = _mintStuff(_to, _authorization.from, _params);
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
     * @dev transferOwnership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();

        owner = newOwner;

        emit OwnerUpdated(newOwner);
    }

    /**
     * @dev updateRelayer.
     */
    function updateRelayer(address newRelayer) external onlyOwner {
        if (newRelayer == address(0)) revert InvalidRelayer();

        relayer = newRelayer;

        emit RelayerUpdated(newRelayer);
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

    /**
     * @dev _mintStuff.
     */
    function _mintStuff(address _to, address _authorAddress, StuffMintParams calldata _params)
        internal
        returns (uint256 tokenId)
    {
        if (tokenIdsIndex >= MAX_SUPPLY) revert MaxSupplyReached();

        tokenId = tokenIdsIndex++;

        Stuff storage stuff = _stuffs[tokenId];

        stuff.author = _params.author;
        stuff.authorAddress = _authorAddress;

        stuff.title = _params.title;
        stuff.description = _params.description;
        stuff.creationDate = block.timestamp;

        stuff.canvas = _validateCanvas(_params.canvas);
        stuff.options = _validateOptions(_params.options);

        _safeMint(_to, tokenId);

        emit StuffCreated(tokenId, stuff.authorAddress, keccak256(stuff.canvas));
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
