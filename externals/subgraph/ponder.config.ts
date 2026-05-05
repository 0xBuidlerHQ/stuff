import { stuffCollectionErc721Abi, stuffCollectionFactoryAbi } from "@0xhq/stuff.contracts";
import deployments from "@0xhq/stuff.contracts/deployments.json";

import { createConfig, factory } from "ponder";
import { parseAbiItem } from "viem";

const CHAIN_ID = "31337";
const STARTBLOCK = 45606823;
const deploymentsByName = deployments as Record<string, Record<string, `0x${string}`>>;
const STUFF_COLLECTION_FACTORY_ADDRESS =
	deploymentsByName.StuffCollectionFactory?.[CHAIN_ID] ??
	deploymentsByName.StuffFactory?.[CHAIN_ID];
const STUFF_COLLECTION_ERC721_CREATED_EVENT =
	"event StuffCollectionERC721Created(uint256 indexed stuffId, address indexed stuffERC721, (string sku,string category,string metadataURI,string[] palette,string[][] options,address paymentToken,address paymentRecipient,uint256 maxSupply,uint256 mintPriceToken) stuffCollection)";

if (!STUFF_COLLECTION_FACTORY_ADDRESS) {
	throw new Error(`Missing StuffCollectionFactory deployment for chain ${CHAIN_ID}`);
}

export default createConfig({
	chains: {
		anvil: {
			id: Number(CHAIN_ID),
			rpc: process.env.PONDER_RPC_URL_1,
		},
	},
	contracts: {
		/**
		 * @dev StuffCollectionFactory.
		 */
		StuffCollectionFactory: {
			chain: "anvil",
			abi: stuffCollectionFactoryAbi,
			address: STUFF_COLLECTION_FACTORY_ADDRESS,
			startBlock: STARTBLOCK,
			filter: {
				event: "StuffCollectionERC721Created",
				args: {},
			},
		},

		/**
		 * @dev StuffCollectionERC721 contracts created by StuffCollectionFactory.
		 */
		StuffCollectionERC721: {
			chain: "anvil",
			abi: stuffCollectionErc721Abi,
			address: factory({
				address: STUFF_COLLECTION_FACTORY_ADDRESS,
				event: parseAbiItem(STUFF_COLLECTION_ERC721_CREATED_EVENT),
				parameter: "stuffERC721",
				startBlock: STARTBLOCK,
			}),
			startBlock: STARTBLOCK,
		},
	},
});
