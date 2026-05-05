import type { StuffCollectionERC721 } from "@0xhq/stuff.contracts/types.user";
import type { SubgraphTypes } from "@0xhq/stuff.subgraph";
import type { StaticImageData } from "next/image";

/**
 * @dev UI StuffCollection type.
 */
type StuffCollection = SubgraphTypes.StuffCollection & {
	assets: StuffAssets;
	slug: SubgraphTypes.StuffCollection["sku"];
};

/**
 * @dev UI StuffItem type.
 */
type StuffItem = SubgraphTypes.StuffItem & {
	collection: StuffCollection;
};

/**
 * @dev UI StuffItemMintParams type.
 */
type StuffItemMintParams = StuffCollectionERC721.StuffItemMintParams;

/**
 * @dev
 */
type StuffAssets = {
	images: StaticImageData[];
	description: string;
	information: string[][];
};

export type { StuffCollection, StuffItem, StuffItemMintParams };
