import type { SubgraphTypes } from "@0xhq/stuff.subgraph";
import { cache } from "react";
import { getStuffAssets } from "@/assets";
import type { Stuff } from "@/config/types";
import { ponderClient, ponderSchema } from "@/providers/ponder.config";

const augmentStuff = (stuff: SubgraphTypes.StuffCollection): Stuff => {
	const assets = getStuffAssets(stuff.sku);
	if (!assets) throw new Error(`Missing assets for stuff sku: ${stuff.sku}`);

	return { ...stuff, assets, slug: stuff.sku };
};

/**
 * @dev getStuffs.
 */
const getStuffs = cache(async () => {
	const stuffs = await ponderClient.db.select().from(ponderSchema.stuffCollection);
	return stuffs.map(augmentStuff);
});

export { getStuffs };
