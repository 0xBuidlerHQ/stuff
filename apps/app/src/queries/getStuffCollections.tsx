import { cache } from "react";
import type { StuffCollection } from "@/config/types";
import { ponderClient, ponderSchema } from "@/providers/ponder.config";
import { augmentStuffCollection } from "@/queries/augments";

/**
 * @dev getStuffCollections.
 */
const getStuffCollections = cache(async (): Promise<StuffCollection[]> => {
	const stuffCollections = await ponderClient.db.select().from(ponderSchema.stuffCollection);
	return stuffCollections.map(augmentStuffCollection);
});

export { augmentStuffCollection, getStuffCollections };
