import { eq } from "@ponder/client";
import { cache } from "react";
import type { StuffCollection } from "@/config/types";
import { ponderClient, ponderSchema } from "@/providers/ponder.config";
import { augmentStuffCollection } from "@/queries/augments";

type GetStuffCollectionBySlugProps = {
	slug: string;
};

const getStuffCollectionBySlug = cache(
	async ({ slug }: GetStuffCollectionBySlugProps): Promise<StuffCollection | null> => {
		const [stuffCollection] = await ponderClient.db
			.select()
			.from(ponderSchema.stuffCollection)
			.where(eq(ponderSchema.stuffCollection.sku, slug))
			.limit(1);
		if (!stuffCollection) return null;

		return augmentStuffCollection(stuffCollection);
	},
);

export { getStuffCollectionBySlug };
