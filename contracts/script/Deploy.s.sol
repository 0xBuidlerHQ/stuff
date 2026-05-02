// script/Deploy.s.sol
pragma solidity ^0.8.20;

import {StdCheats} from "forge-std/StdCheats.sol";

import {StuffERC721} from "@stuff/StuffERC721.sol";
import {StuffFactory} from "@stuff/StuffFactory.sol";

import {Actors} from "./utils/Actors.s.sol";
import {Packages} from "./utils/Packages.s.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Deploy is Actors, Packages, StdCheats {
    using SafeERC20 for IERC20;

    bytes32 internal constant SALT = keccak256("SALT");

    address internal constant RELAYER = 0x63Cbfe3908480b5f745122DB1a50E5C2A6AE9425;
    address internal constant BASE_USDC_WHALE = 0x8da91A6298eA5d1A8Bc985e99798fd0A0f05701a;

    address internal constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    uint256 internal constant ANVIL_CHAIN_ID = 31337;
    uint256 internal constant BASE_CHAIN_ID = 8453;
    uint256 internal constant BASE_SEPOLIA_CHAIN_ID = 84532;

    uint256 internal constant INITIAL_USDC_BALANCE = 1_000e6;
    uint256 internal constant STUFF_MAX_SUPPLY = 10_000;
    uint256 internal constant STUFF_MINT_PRICE_USDC = 1e6;

    error UnsupportedChain(uint256 chainId);
    error InsufficientWhaleBalance(address whale, uint256 balance, uint256 required);

    function run() external {
        Actor memory deployer = actor("DEPLOYER", 0);
        Actor memory alice = actor("alice", 1);
        Actor memory bob = actor("bob", 2);

        logActor(deployer);
        logActor(alice);
        logActor(bob);

        /*******************************
         * @dev Set Up.
        *******************************/

        IERC20 usdc = IERC20(_getUsdcAddress());

        _fundLocalActors(deployer, usdc, alice.addr, bob.addr);

        /*******************************
         * @dev Deploy contracts.
         *******************************/
        start(deployer);

        /**
         * @dev Pures.
         */
        StuffFactory stuffFactory = new StuffFactory{salt: SALT}();
        StuffERC721 stuffERC721 = stuffFactory.createStuffERC721(
            StuffERC721.StuffBlueprint({
                sku: "stuff-00000",
                category: "garment",
                metadataURI: "https://example.com/stuff-00000.json",
                palette: _getPalette(),
                options: _getOptions(),
                //
                paymentToken: usdc,
                paymentRecipient: deployer.addr,
                maxSupply: STUFF_MAX_SUPPLY,
                mintPriceToken: STUFF_MINT_PRICE_USDC
            }),
            deployer.addr,
            RELAYER
        );

        stop();

        /**
         * @dev Logs.
         */
        addDeployment("USDC", address(usdc));

        addDeployment("StuffFactory", address(stuffFactory));
        addDeployment("StuffERC721", address(stuffERC721));
    }

    function _fundLocalActors(Actor memory deployer, IERC20 usdc, address alice, address bob) internal {
        if (block.chainid != ANVIL_CHAIN_ID) return;

        deployer;

        uint256 required = INITIAL_USDC_BALANCE * 3;
        uint256 whaleBalance = usdc.balanceOf(BASE_USDC_WHALE);

        if (whaleBalance < required) {
            revert InsufficientWhaleBalance(BASE_USDC_WHALE, whaleBalance, required);
        }

        vm.rpc("anvil_setBalance", string.concat("[\"", vm.toString(BASE_USDC_WHALE), "\",\"0xde0b6b3a7640000\"]"));
        vm.rpc("anvil_impersonateAccount", string.concat("[\"", vm.toString(BASE_USDC_WHALE), "\"]"));

        _sendUsdcFromWhale(address(usdc), BASE_USDC_WHALE, alice, INITIAL_USDC_BALANCE);
        _sendUsdcFromWhale(address(usdc), BASE_USDC_WHALE, bob, INITIAL_USDC_BALANCE);
        _sendUsdcFromWhale(address(usdc), BASE_USDC_WHALE, RELAYER, INITIAL_USDC_BALANCE);

        vm.rpc("anvil_stopImpersonatingAccount", string.concat("[\"", vm.toString(BASE_USDC_WHALE), "\"]"));
    }

    function _sendUsdcFromWhale(address usdc, address whale, address to, uint256 amount) internal {
        bytes memory data = abi.encodeCall(IERC20.transfer, (to, amount));

        vm.rpc(
            "eth_sendTransaction",
            string.concat(
                "[{\"from\":\"",
                vm.toString(whale),
                "\",\"to\":\"",
                vm.toString(usdc),
                "\",\"data\":\"",
                vm.toString(data),
                "\"}]"
            )
        );
    }

    function _getUsdcAddress() internal view returns (address usdc) {
        if (block.chainid == BASE_CHAIN_ID) return BASE_USDC;
        if (block.chainid == BASE_SEPOLIA_CHAIN_ID) return BASE_SEPOLIA_USDC;

        if (block.chainid == ANVIL_CHAIN_ID) return BASE_USDC;

        revert UnsupportedChain(block.chainid);
    }

    function _getPalette() internal pure returns (string[] memory palette) {
        palette = new string[](16);

        palette[0] = "#2563eb";
        palette[1] = "#facc15";
        palette[2] = "#111111";
        palette[3] = "#ffffff";
        palette[4] = "#ef4444";
        palette[5] = "#22c55e";
        palette[6] = "#14b8a6";
        palette[7] = "#38bdf8";
        palette[8] = "#f97316";
        palette[9] = "#8b5cf6";
        palette[10] = "#ec4899";
        palette[11] = "#a16207";
        palette[12] = "#737373";
        palette[13] = "#d4d4d4";
        palette[14] = "#0f172a";
        palette[15] = "#f8fafc";
    }

    function _getOptions() internal pure returns (string[][] memory options) {
        options = new string[][](1);

        options[0] = new string[](7);
        options[0][0] = "size";
        options[0][1] = "XS";
        options[0][2] = "S";
        options[0][3] = "M";
        options[0][4] = "L";
        options[0][5] = "XL";
        options[0][6] = "XXL";
    }
}
