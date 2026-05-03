import { stuffErc721Abi, stuffFactoryAbi, stuffFactoryAddress } from "@0xhq/stuff.contracts";

import { createConfig, factory } from "ponder";
import { parseAbiItem } from "viem";

const CHAIN_ID = "31337";
const STARTBLOCK = 45483970;

export default createConfig({
	chains: {
		anvil: {
			id: Number(CHAIN_ID),
			rpc: process.env.PONDER_RPC_URL_1,
		},
	},
	contracts: {
		/**
		 * @dev StuffFactory.
		 */
		StuffFactory: {
			chain: "anvil",
			abi: stuffFactoryAbi,
			address: stuffFactoryAddress[CHAIN_ID],
			startBlock: STARTBLOCK,
			filter: {
				event: "StuffERC721Created",
				args: {},
			},
		},

		/**
		 * @dev StuffERC721 contracts created by StuffFactory.
		 */
		StuffERC721: {
			chain: "anvil",
			abi: stuffErc721Abi,
			address: factory({
				address: stuffFactoryAddress[CHAIN_ID],
				event: parseAbiItem(
					"event StuffERC721Created(uint256 indexed stuffId, address indexed stuffERC721)",
				),
				parameter: "stuffERC721",
				startBlock: STARTBLOCK,
			}),
			startBlock: STARTBLOCK,
		},
	},
});
