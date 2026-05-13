import { and, eq } from "@ponder/client";
import { cache } from "react";
import type { StuffItem } from "@/config/types";
import { ponderClient, ponderSchema } from "@/providers/ponder.config";
import { augmentStuffItem } from "@/queries/augments";
import { getStuffCollectionBySlug } from "@/queries/getStuffCollectionBySlug";

type GetStuffItemBySlugAndIdProps = {
	slug: string;
	itemId: string;
};

const getStuffItemBySlugAndId = cache(
	async ({ slug, itemId }: GetStuffItemBySlugAndIdProps): Promise<StuffItem | null> => {
		let tokenId: bigint;

		try {
			tokenId = BigInt(itemId);
		} catch {
			return null;
		}

		const stuffCollection = await getStuffCollectionBySlug({ slug });
		if (!stuffCollection) return null;

		const [stuffItem] = await ponderClient.db
			.select()
			.from(ponderSchema.stuffItem)
			.where(
				and(
					eq(
						ponderSchema.stuffItem.stuffCollectionAddress,
						stuffCollection.address.toLowerCase() as typeof stuffCollection.address,
					),
					eq(ponderSchema.stuffItem.tokenId, tokenId),
				),
			)
			.limit(1);

		if (!stuffItem) return null;

		const stuffCollectionsByAddress = new Map([
			[stuffCollection.address.toLowerCase(), stuffCollection],
		]);
		return augmentStuffItem(stuffItem, stuffCollectionsByAddress);
	},
);

export { getStuffItemBySlugAndId };
