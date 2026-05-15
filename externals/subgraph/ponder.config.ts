import {
	pantoneRegistryAbi,
	stuffCollectionErc721Abi,
	stuffCollectionFactoryAbi,
} from "@0xhq/stuff.contracts";
import deployments from "@0xhq/stuff.contracts/deployments.json";

import { createConfig, factory } from "ponder";
import { getAbiItem } from "viem";

const CHAIN_ID = "31337";
type DeploymentHistoryEntry = {
	startBlock: number;
};

type AddressDeployments = Record<string, Record<string, `0x${string}`>>;

type Deployments = {
	[name: string]: unknown;
	dev?: Record<string, DeploymentHistoryEntry>;
};

const deploymentsByName = deployments as unknown as Deployments;
const addressDeployments = deploymentsByName as unknown as AddressDeployments;
const latestDevDeployment = deploymentsByName.dev?.[CHAIN_ID];
const STARTBLOCK = latestDevDeployment?.startBlock;
const STUFF_COLLECTION_FACTORY_ADDRESS =
	addressDeployments.StuffCollectionFactory?.[CHAIN_ID] ??
	addressDeployments.StuffFactory?.[CHAIN_ID];
const PANTONE_REGISTRY_ADDRESS = addressDeployments.PantoneRegistry?.[CHAIN_ID];
const STUFF_COLLECTION_ERC721_CREATED_EVENT = getAbiItem({
	abi: stuffCollectionFactoryAbi,
	name: "StuffCollectionERC721Created",
});

if (!STUFF_COLLECTION_FACTORY_ADDRESS) {
	throw new Error(`Missing StuffCollectionFactory deployment for chain ${CHAIN_ID}`);
}

if (!PANTONE_REGISTRY_ADDRESS) {
	throw new Error(`Missing PantoneRegistry deployment for chain ${CHAIN_ID}`);
}

if (STARTBLOCK == null) {
	throw new Error(`Missing dev deployment startBlock for chain ${CHAIN_ID}`);
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
		 * @dev PantoneRegistry.
		 */
		PantoneRegistry: {
			chain: "anvil",
			abi: pantoneRegistryAbi,
			address: PANTONE_REGISTRY_ADDRESS,
			startBlock: STARTBLOCK,
		},

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
				event: STUFF_COLLECTION_ERC721_CREATED_EVENT,
				parameter: "stuffERC721",
				startBlock: STARTBLOCK,
			}),
			startBlock: STARTBLOCK,
		},
	},
});
