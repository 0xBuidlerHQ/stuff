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
 * @dev UI StuffItemCart type.
 */
type StuffItemCart = StuffItemMintParams & {
	stuffCollectionAddress: StuffCollection["address"];
};

/**
 * @dev
 */
type StuffAssets = {
	images: StaticImageData[];
	description: string;
	information: string[][];
	productSpecs: {
		material: string[];
		provenance: string[];
		priceBreakdown: Array<{ label: string; value: string }>;
	};
};

/**
 * @dev
 */
type PantoneColor = SubgraphTypes.Pantone;

/**
 * @dev
 */
type MainColors = {
	black: PantoneColor;
	white: PantoneColor;
	yellow: PantoneColor;
	blue: PantoneColor;
};

export type {
	MainColors,
	PantoneColor,
	StuffCollection,
	StuffItem,
	StuffItemCart,
	StuffItemMintParams,
};
