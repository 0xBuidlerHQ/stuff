import type { SubgraphTypes } from "@0xhq/stuff.subgraph";
import { cache } from "react";
import { getStuffAssets } from "@/assets";
import type { StuffCollection } from "@/config/types";
import { ponderClient, ponderSchema } from "@/providers/ponder.config";

const augmentStuffCollection = (stuff: SubgraphTypes.StuffCollection) => {
	const assets = getStuffAssets(stuff.sku);
	if (!assets) throw new Error(`Missing assets for stuff sku: ${stuff.sku}`);

	return { ...stuff, assets, slug: stuff.sku };
};

/**
 * @dev getStuffCollections.
 */
const getStuffCollections = cache(async () => {
	const stuffCollections = await ponderClient.db.select().from(ponderSchema.stuffCollection);
	return stuffCollections.map(augmentStuffCollection) as StuffCollection[];
});

export { getStuffCollections };
