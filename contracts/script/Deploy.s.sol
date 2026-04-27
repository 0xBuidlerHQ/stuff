// script/Deploy.s.sol
pragma solidity ^0.8.20;

import {StdCheats} from "forge-std/StdCheats.sol";

import {StuffERC721} from "@stuff/StuffERC721.sol";
import {StuffFactory} from "@stuff/StuffFactory.sol";

import {Actors} from "./utils/Actors.s.sol";
import {Packages} from "./utils/Packages.s.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deploy is Actors, Packages, StdCheats {
    bytes32 internal constant SALT = keccak256("SALT");

    address internal constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    uint256 internal constant BASE_CHAIN_ID = 8453;
    uint256 internal constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint256 internal constant INITIAL_USDC_BALANCE = 1_000e6;
    uint256 internal constant STUFF_MAX_SUPPLY = 10_000;
    uint256 internal constant STUFF_MINT_PRICE_USDC = 1e6;

    error UnsupportedChain(uint256 chainId);

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

        deal(address(usdc), alice.addr, INITIAL_USDC_BALANCE);
        deal(address(usdc), bob.addr, INITIAL_USDC_BALANCE);

        /*******************************
         * @dev Deploy contracts.
         *******************************/
        start(deployer);

        /**
         * @dev Pures.
         */
        StuffFactory stuffFactory = new StuffFactory{salt: SALT}();
        StuffERC721 stuffERC721 = stuffFactory.createStuffERC721(
            StuffERC721.StuffCollection({
                name: "Genesis",
                symbol: "STUFF#000",
                //
                sku: "stuff-000",
                palette: _getPalette(),
                //
                paymentToken: usdc,
                paymentRecipient: deployer.addr,
                maxSupply: STUFF_MAX_SUPPLY,
                mintPriceToken: STUFF_MINT_PRICE_USDC
            })
        );

        stop();

        /**
         * @dev Logs.
         */
        addDeployment("USDC", address(usdc));

        addDeployment("StuffFactory", address(stuffFactory));
        addDeployment("StuffERC721", address(stuffERC721));
    }

    function _getUsdcAddress() internal view returns (address usdc) {
        if (block.chainid == BASE_CHAIN_ID) return BASE_USDC;
        if (block.chainid == BASE_SEPOLIA_CHAIN_ID) return BASE_SEPOLIA_USDC;

        revert UnsupportedChain(block.chainid);
    }

    function _getPalette() internal pure returns (string[] memory palette) {
        palette = new string[](16);

        palette[0] = "#111111";
        palette[1] = "#ffffff";
        palette[2] = "#ef4444";
        palette[3] = "#f97316";
        palette[4] = "#facc15";
        palette[5] = "#22c55e";
        palette[6] = "#14b8a6";
        palette[7] = "#38bdf8";
        palette[8] = "#2563eb";
        palette[9] = "#8b5cf6";
        palette[10] = "#ec4899";
        palette[11] = "#a16207";
        palette[12] = "#737373";
        palette[13] = "#d4d4d4";
        palette[14] = "#0f172a";
        palette[15] = "#f8fafc";
    }
}
