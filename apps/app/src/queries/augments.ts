import type { SubgraphTypes } from "@0xhq/stuff.subgraph";
import { getStuffAssets } from "@/assets";
import type { StuffCollection, StuffItem } from "@/config/types";

const augmentStuffCollection = (stuff: SubgraphTypes.StuffCollection): StuffCollection => {
	const assets = getStuffAssets(stuff.sku);
	if (!assets) throw new Error(`Missing assets for stuff sku: ${stuff.sku}`);

	return { ...stuff, assets, slug: stuff.sku };
};

const augmentStuffItem = (
	stuffItem: SubgraphTypes.StuffItem,
	stuffCollectionsByAddress: Map<string, StuffCollection>,
): StuffItem | null => {
	const collection = stuffCollectionsByAddress.get(stuffItem.stuffCollectionAddress.toLowerCase());

	if (!collection) return null;

	return { ...stuffItem, collection };
};

export { augmentStuffCollection, augmentStuffItem };
