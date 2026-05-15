// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @dev Registry of printable Pantone TCX colors.
 * Stores only:
 * - pantone code (e.g. "19-4052 TCX")
 * - hex value
 * - cmyk value
 */
contract PantoneRegistry {
    struct Pantone {
        string pantone;
        string hexValue;
        string cmyk;
        bool exists;
    }

    address public owner;

    mapping(string => Pantone) private _pantones;

    event PantoneCreated(string pantone, string hexValue, string cmyk);
    event PantoneUpdated(string pantone, string hexValue, string cmyk);
    event OwnerUpdated(address indexed owner);

    error Unauthorized();
    error InvalidOwner();
    error InvalidPantone();
    error PantoneAlreadyExists(string pantone);
    error PantoneNotFound(string pantone);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert Unauthorized();
    }

    constructor(address _owner) {
        if (_owner == address(0)) revert InvalidOwner();

        owner = _owner;

        _seedTCXColors();
    }

    function createPantone(string calldata _pantone, string calldata _hexValue, string calldata _cmyk)
        external
        onlyOwner
    {
        _validatePantone(_pantone, _hexValue, _cmyk);

        if (_pantones[_pantone].exists) {
            revert PantoneAlreadyExists(_pantone);
        }

        _createPantone(_pantone, _hexValue, _cmyk);
    }

    function updatePantone(string calldata _pantone, string calldata _hexValue, string calldata _cmyk)
        external
        onlyOwner
    {
        _validatePantone(_pantone, _hexValue, _cmyk);

        if (!_pantones[_pantone].exists) {
            revert PantoneNotFound(_pantone);
        }

        _setPantone(_pantone, _hexValue, _cmyk);

        emit PantoneUpdated(_pantone, _hexValue, _cmyk);
    }

    function transferOwnership(address _owner) external onlyOwner {
        if (_owner == address(0)) revert InvalidOwner();

        owner = _owner;

        emit OwnerUpdated(_owner);
    }

    function hasPantone(string calldata _pantone) external view returns (bool) {
        return _pantones[_pantone].exists;
    }

    function getPantone(string calldata _pantone) external view returns (Pantone memory pantone) {
        pantone = _pantones[_pantone];

        if (!pantone.exists) {
            revert PantoneNotFound(_pantone);
        }
    }

    function _validatePantone(string memory _pantone, string memory _hexValue, string memory _cmyk) internal pure {
        if (bytes(_pantone).length == 0 || bytes(_hexValue).length == 0 || bytes(_cmyk).length == 0) {
            revert InvalidPantone();
        }
    }

    function _setPantone(string memory _pantone, string memory _hexValue, string memory _cmyk) internal {
        _pantones[_pantone] = Pantone({pantone: _pantone, hexValue: _hexValue, cmyk: _cmyk, exists: true});
    }

    function _createPantone(string memory _pantone, string memory _hexValue, string memory _cmyk) internal {
        _setPantone(_pantone, _hexValue, _cmyk);

        emit PantoneCreated(_pantone, _hexValue, _cmyk);
    }

    function _seedPantone(string memory _pantone, string memory _hexValue, string memory _cmyk) internal {
        if (_pantones[_pantone].exists) return;

        _createPantone(_pantone, _hexValue, _cmyk);
    }

    /**
     * @dev Seed a small core set of popular Pantone Fashion, Home + Interiors (TCX) colors.
     * You can extend this list with the full TCX library if desired.
     */
    function _seedTCXColors() internal {
        // =========================
        // NEUTRALS / WHITES / GRAYS
        // =========================
        _seedPantone("19-3911 TCX", "#27272A", "7, 7, 0, 84");
        _seedPantone("11-0601 TCX", "#F0EEE9", "0, 1, 3, 6");
        _seedPantone("11-4300 TCX", "#EAEAEA", "0, 0, 0, 8");
        _seedPantone("12-0000 TCX", "#F6F6F6", "0, 0, 0, 4");
        _seedPantone("13-0002 TCX", "#D9D6CF", "0, 2, 5, 15");
        _seedPantone("17-5104 TCX", "#939597", "2, 1, 0, 41");

        // =========================
        // BEIGE / TAN / BROWNS
        // =========================
        _seedPantone("14-1118 TCX", "#D8C0A8", "0, 11, 22, 15");
        _seedPantone("15-1214 TCX", "#C19A6B", "0, 20, 44, 24");
        _seedPantone("16-1334 TCX", "#B06C49", "0, 39, 58, 31");
        _seedPantone("17-1230 TCX", "#A47864", "0, 27, 39, 36");
        _seedPantone("18-1140 TCX", "#8B5A2B", "0, 35, 69, 45");
        _seedPantone("18-1438 TCX", "#955251", "0, 45, 46, 42");
        _seedPantone("19-0915 TCX", "#5C4033", "0, 30, 44, 64");
        _seedPantone("19-0809 TCX", "#3B2F2F", "0, 20, 20, 77");

        // =========================
        // YELLOWS / GOLDS
        // =========================
        _seedPantone("11-0103 TCX", "#F4F5ED", "1, 0, 4, 4");
        _seedPantone("12-0713 TCX", "#F7E7CE", "0, 7, 16, 3");
        _seedPantone("13-0647 TCX", "#F5DF4D", "0, 9, 69, 4");
        _seedPantone("13-0858 TCX", "#FCE883", "0, 7, 48, 1");
        _seedPantone("14-0848 TCX", "#FFD700", "0, 16, 100, 0");
        _seedPantone("14-0957 TCX", "#E3B505", "0, 21, 98, 11");
        _seedPantone("15-0850 TCX", "#DAA520", "0, 24, 85, 15");
        _seedPantone("15-1040 TCX", "#D9A441", "0, 24, 70, 15");
        _seedPantone("16-0948 TCX", "#C99700", "0, 24, 100, 21");
        _seedPantone("16-0952 TCX", "#BDB76B", "0, 3, 43, 26");
        _seedPantone("17-1047 TCX", "#808000", "0, 0, 100, 50");
        _seedPantone("17-1048 TCX", "#B58150", "0, 29, 56, 29");
        _seedPantone("18-0830 TCX", "#6B5E00", "0, 12, 100, 58");
        _seedPantone("19-0820 TCX", "#4B5320", "10, 0, 61, 67");

        // =========================
        // PEACH / APRICOT / ORANGES
        // =========================
        _seedPantone("11-0602 TCX", "#F9EAD3", "0, 6, 15, 2");
        _seedPantone("13-1020 TCX", "#FFDAB9", "0, 15, 27, 0");
        _seedPantone("13-1023 TCX", "#FFBE98", "0, 25, 40, 0");
        _seedPantone("14-1228 TCX", "#F4A460", "0, 34, 61, 4");
        _seedPantone("15-1340 TCX", "#F4A259", "0, 34, 64, 4");
        _seedPantone("16-1364 TCX", "#E67E22", "0, 46, 85, 10");
        _seedPantone("16-1546 TCX", "#FF6F61", "0, 56, 53, 0");
        _seedPantone("17-1456 TCX", "#E25822", "0, 61, 85, 11");
        _seedPantone("17-1463 TCX", "#DD4124", "0, 70, 84, 13");
        _seedPantone("18-1449 TCX", "#CC5500", "0, 58, 100, 20");

        // =========================
        // CORAL / SALMON
        // =========================
        _seedPantone("13-1404 TCX", "#F4C6C3", "0, 19, 20, 4");
        _seedPantone("14-1511 TCX", "#E9967A", "0, 35, 48, 9");
        _seedPantone("15-1520 TCX", "#FA8072", "0, 49, 54, 2");
        _seedPantone("16-1543 TCX", "#FF7F50", "0, 50, 69, 0");
        _seedPantone("17-1563 TCX", "#E2725B", "0, 50, 60, 11");
        _seedPantone("18-1658 TCX", "#CD5B45", "0, 56, 66, 20");

        // =========================
        // REDS / BURGUNDY
        // =========================
        _seedPantone("18-1750 TCX", "#BB2649", "0, 80, 61, 27");
        _seedPantone("19-1664 TCX", "#A63A3A", "0, 65, 65, 35");
        _seedPantone("19-2434 TCX", "#722F37", "0, 58, 51, 55");

        // =========================
        // PINKS / ROSES
        // =========================
        _seedPantone("11-1404 TCX", "#FADADD", "0, 13, 11, 2");
        _seedPantone("12-2904 TCX", "#F4C2C2", "0, 20, 20, 4");
        _seedPantone("13-1520 TCX", "#F7CAC9", "0, 18, 18, 3");
        _seedPantone("15-2215 TCX", "#D291BC", "0, 31, 10, 18");
        _seedPantone("16-2124 TCX", "#E75480", "0, 63, 44, 9");

        // =========================
        // MAGENTA / FUCHSIA
        // =========================
        _seedPantone("17-2520 TCX", "#C71585", "0, 89, 33, 22");
        _seedPantone("18-2143 TCX", "#A94064", "0, 61, 40, 34");

        // =========================
        // LAVENDER / PURPLES
        // =========================
        _seedPantone("13-2808 TCX", "#DEB7D9", "0, 18, 3, 13");
        _seedPantone("14-2710 TCX", "#D8BFD8", "0, 12, 0, 15");
        _seedPantone("14-3812 TCX", "#C8A2C8", "0, 18, 0, 22");
        _seedPantone("15-3817 TCX", "#B39EB5", "2, 13, 0, 29");
        _seedPantone("18-3224 TCX", "#B565A7", "0, 44, 7, 29");

        // =========================
        // VIOLET / INDIGO
        // =========================
        _seedPantone("16-3810 TCX", "#9966CC", "25, 50, 0, 20");
        _seedPantone("17-3930 TCX", "#8A2BE2", "39, 81, 0, 11");
        _seedPantone("18-3838 TCX", "#5F4B8B", "32, 46, 0, 45");
        _seedPantone("18-3943 TCX", "#6A0DAD", "39, 92, 0, 32");
        _seedPantone("19-3720 TCX", "#4B0082", "42, 100, 0, 49");

        // =========================
        // AQUA / TURQUOISE
        // =========================
        _seedPantone("11-4800 TCX", "#E0FFFF", "12, 0, 0, 0");
        _seedPantone("12-4604 TCX", "#B0E0E6", "23, 3, 0, 10");
        _seedPantone("13-4409 TCX", "#AFEEEE", "26, 0, 0, 7");
        _seedPantone("15-3919 TCX", "#92A8D1", "30, 19, 0, 18");

        // =========================
        // BLUES
        // =========================
        _seedPantone("14-4318 TCX", "#ADD8E6", "25, 6, 0, 10");
        _seedPantone("15-4421 TCX", "#87CEEB", "43, 12, 0, 8");
        _seedPantone("16-4535 TCX", "#5F9EA0", "41, 2, 0, 37");
        _seedPantone("17-4728 TCX", "#4682B4", "61, 28, 0, 29");
        _seedPantone("18-4032 TCX", "#4169E1", "71, 53, 0, 12");
        _seedPantone("19-4024 TCX", "#003366", "100, 50, 0, 60");
        _seedPantone("19-4052 TCX", "#0F4C81", "88, 66, 0, 49");

        // =========================
        // GREENS
        // =========================
        _seedPantone("11-0608 TCX", "#F0FFF0", "6, 0, 6, 0");
        _seedPantone("12-0312 TCX", "#E0FFE0", "12, 0, 12, 0");
        _seedPantone("13-0221 TCX", "#98FB98", "39, 0, 39, 2");
        _seedPantone("14-0446 TCX", "#90EE90", "39, 0, 39, 7");
        _seedPantone("15-0341 TCX", "#32CD32", "76, 0, 76, 20");
        _seedPantone("15-0343 TCX", "#88B04B", "23, 0, 57, 31");
        _seedPantone("16-0237 TCX", "#00FF7F", "100, 0, 50, 0");
        _seedPantone("17-5641 TCX", "#009B77", "100, 0, 24, 39");
        _seedPantone("18-6024 TCX", "#2E8B57", "67, 0, 38, 45");
        _seedPantone("19-5513 TCX", "#013220", "98, 0, 37, 80");

        // =========================
        // IVORY / CREAM
        // =========================
        _seedPantone("11-0605 TCX", "#FFF5EE", "0, 4, 7, 0");
        _seedPantone("12-0812 TCX", "#FAFAD2", "0, 0, 16, 2");
        _seedPantone("13-0822 TCX", "#EEE8AA", "0, 3, 29, 7");

        // =========================
        // SOFT PURPLE TINTS
        // =========================
        _seedPantone("11-4201 TCX", "#F8F8FF", "3, 3, 0, 0");
        _seedPantone("12-4302 TCX", "#E6E6FA", "7, 7, 0, 2");
    }
}
