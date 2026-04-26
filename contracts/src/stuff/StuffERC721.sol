// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev StuffERC721.
 */
contract StuffERC721 is ERC721, ERC721Enumerable {
    using SafeERC20 for IERC20;

    /**
     * @dev Constants.
     */
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MINT_PRICE_USDC = 100e6;

    uint256 public constant CANVAS_WIDTH = 32;
    uint256 public constant CANVAS_HEIGHT = 32;
    uint256 public constant CANVAS_SIZE = CANVAS_WIDTH * CANVAS_HEIGHT;

    uint8 public constant PALETTE_SIZE = 16;

    /**
     * @dev Struct StuffParams.
     */
    struct StuffParams {
        string authorName;

        string title;
        string description;
        bytes canvas;
    }

    /**
     * @dev Struct Stuff.
     */
    struct Stuff {
        string authorName;
        address authorAddress;

        string title;
        string description;
        uint256 creationDate;
        bytes canvas;
    }

    /**
     * @dev Struct Oklch.
     *
     * Lightness and chroma are encoded in basis points:
     * - lightness: 9800 = 98%
     * - chroma: 2100 = 0.21
     *
     * Hue is encoded in degrees.
     */
    struct Oklch {
        uint16 lightness;
        uint16 chroma;
        uint16 hue;
    }

    /**
     * @dev Immutables.
     */
    IERC20 public immutable USDC;
    address public immutable PAYMENT_RECIPIENT;

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

    /**
     * @dev Errors.
     */
    error InvalidPaymentConfig();
    error MaxSupplyReached();
    error InvalidCanvasLength(uint256 length);
    error PaletteIndexOutOfRange(uint8 colorIndex);

    /**
     * @dev Constructor.
     */
    constructor(IERC20 _usdc, address _paymentRecipient) ERC721("Stuff", "Stuff") {
        if (address(_usdc) == address(0) || _paymentRecipient == address(0)) revert InvalidPaymentConfig();

        USDC = _usdc;
        PAYMENT_RECIPIENT = _paymentRecipient;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev
     */
    function mint(address _to, StuffParams calldata _params) external returns (uint256 tokenId) {
        if (tokenIdsIndex >= MAX_SUPPLY) revert MaxSupplyReached();

        tokenId = tokenIdsIndex++;

        Stuff storage stuff = _stuffs[tokenId];

        stuff.authorName = _params.authorName;
        stuff.authorAddress = msg.sender;

        stuff.title = _params.title;
        stuff.description = _params.description;
        stuff.creationDate = block.timestamp;

        _setCanvas(tokenId, _params.canvas);

        USDC.safeTransferFrom(msg.sender, PAYMENT_RECIPIENT, MINT_PRICE_USDC);

        _safeMint(_to, tokenId);

        emit StuffCreated(tokenId, stuff.authorAddress, keccak256(stuff.canvas));
    }

    /**
     * @dev
     */
    function getStuff(uint256 _tokenId) external view returns (Stuff memory data) {
        _requireOwned(_tokenId);

        data = _stuffs[_tokenId];
    }

    /**
     * @dev
     */
    function getPalette() public pure returns (Oklch[PALETTE_SIZE] memory palette) {
        palette = [
            Oklch({lightness: 9800, chroma: 100, hue: 95}),
            Oklch({lightness: 2000, chroma: 200, hue: 260}),
            Oklch({lightness: 6200, chroma: 2100, hue: 28}),
            Oklch({lightness: 7400, chroma: 1800, hue: 55}),
            Oklch({lightness: 8400, chroma: 1600, hue: 95}),
            Oklch({lightness: 7800, chroma: 1800, hue: 145}),
            Oklch({lightness: 7000, chroma: 1600, hue: 185}),
            Oklch({lightness: 6400, chroma: 2000, hue: 245}),
            Oklch({lightness: 5800, chroma: 2300, hue: 285}),
            Oklch({lightness: 6800, chroma: 2000, hue: 325}),
            Oklch({lightness: 8600, chroma: 800, hue: 25}),
            Oklch({lightness: 7400, chroma: 600, hue: 75}),
            Oklch({lightness: 5800, chroma: 500, hue: 150}),
            Oklch({lightness: 4800, chroma: 500, hue: 225}),
            Oklch({lightness: 3500, chroma: 300, hue: 260}),
            Oklch({lightness: 800, chroma: 100, hue: 260})
        ];
    }

    /**
     * @dev
     */
    function _setCanvas(uint256 _tokenId, bytes calldata _canvas) internal {
        if (_canvas.length != CANVAS_SIZE) revert InvalidCanvasLength(_canvas.length);

        for (uint256 i = 0; i < CANVAS_SIZE; i++) {
            uint8 colorIndex = uint8(_canvas[i]);
            if (colorIndex >= PALETTE_SIZE) revert PaletteIndexOutOfRange(colorIndex);
        }

        _stuffs[_tokenId].canvas = _canvas;
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
